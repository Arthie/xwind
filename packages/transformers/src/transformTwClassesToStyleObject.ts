import postcss from "postcss";
import merge from "lodash/merge";
//@ts-ignore
const timsort = require("timsort");

import {
  TwObject,
  StyleObject,
  StyleObjectRuleOrAtRule,
} from "./transformPostcss";

//@ts-ignore
import objectify from "./postcssjs-objectify";

import { unescapeCSS } from "./parseTwSelector";

function getStyleObjectFromTwObject(
  twObjectRoot: postcss.Root,
  twClass: string
): StyleObject {
  const root = twObjectRoot.clone();
  root.walkRules((rule) => {
    if (rule.nodes) {
      const unescapedCSS = unescapeCSS(rule.selector);
      if (unescapedCSS === `.${twClass}`) {
        rule.replaceWith(rule.nodes);
      } else {
        rule.selector = unescapedCSS.replace(
          new RegExp(`\\S*${twClass}`, "g"),
          "&"
        );
        if (rule.selector === "&") {
          rule.replaceWith(rule.nodes);
        }
      }
    } else {
      throw new Error(`Rule has no nodes ${root}`);
    }
  });
  return objectify(root);
}

function applySubstituteRules(
  variant: postcss.AtRuleNewProps,
  twObjectRoot: postcss.Root,
  getSubstituteRules: (root: postcss.Root) => void
) {
  const root = twObjectRoot.clone();
  if (!root.first || root.first.type !== "rule") {
    throw new Error(`Root's first node is not of type 'rule' ${root}`);
  }
  const atRule = postcss.atRule(variant);
  atRule.append(root.first.clone());
  root.first.replaceWith(atRule);

  getSubstituteRules(root);
  return root;
}

function sortStyleObject<T extends StyleObject>(styleObject: T) {
  const styleObjectEntries = Object.entries(styleObject);

  //also sort nested style Rules / atRules
  for (const [index, [key, value]] of styleObjectEntries.entries()) {
    if (typeof value === "object" && !Array.isArray(value)) {
      const sortedValue = sortStyleObject<StyleObjectRuleOrAtRule>(value);
      styleObjectEntries[index] = [key, sortedValue];
    }
  }

  const getValueType = <T>(key: string, value: T) => {
    const type = typeof value;
    if (type === "string") {
      if (key.startsWith("--")) {
        return "declVariable";
      }
      return "decl";
    }
    if (type === "object") {
      if (Array.isArray(value)) {
        return "declArray";
      }
      if (key.startsWith("@")) {
        return "atRule";
      }
      if (key.includes("&")) {
        return "rule";
      }
    }

    throw new Error(`This type: ${type} of value: ${value} is not supported`);
  };

  timsort.sort(
    styleObjectEntries,
    //@ts-ignore
    ([first, firstValue], [second, secondValue]) => {
      const firstValueType = getValueType(first, firstValue);
      const secondValueType = getValueType(second, secondValue);

      const firstIsDecl = firstValueType.startsWith("decl");
      const secondIsDecl = secondValueType.startsWith("decl");
      if (firstIsDecl || secondIsDecl) {
        if (firstIsDecl && secondIsDecl) {
          const firstIsCssVar = firstValueType === "declVariable";
          const secondIsCssVar = secondValueType === "declVariable";
          if (firstValueType && secondIsCssVar) return 0;
          if (firstIsCssVar) return -1;
          if (secondIsCssVar) return 1;
          return 0;
        }

        if (firstIsDecl) return -1;
        if (secondIsDecl) return 1;
      }

      const firstIsAtRule = firstValueType === "atRule";
      const secondIsAtRule = secondValueType === "atRule";

      //TODO better compare for media queries
      if (firstIsAtRule && secondIsAtRule) {
        const firstNumber = parseInt(first.replace(/[^0-9]*/g, ""));
        const secondNumber = parseInt(second.replace(/[^0-9]*/g, ""));
        if (firstNumber < secondNumber) {
          return -1;
        }
        if (firstNumber > secondNumber) {
          return 1;
        }
        return 0;
      }

      if (firstIsAtRule) {
        return 1;
      }

      if (secondIsAtRule) {
        return -1;
      }

      return 0;
    }
  );

  return Object.fromEntries(styleObjectEntries);
}

export function transformTwClassesToStyleObject(
  twObjectMap: Map<string, TwObject>,
  twParsedClasses: [string, string[]][],
  screens: string[],
  variants: string[],
  getSubstituteScreenAtRules: (root: postcss.Root) => void,
  getSubstituteVariantsAtRules: (root: postcss.Root) => void
) {
  const mergedStyleObject: StyleObject = {};

  for (const [twClass, twClassVariants] of twParsedClasses) {
    const twObject = twObjectMap.get(twClass);
    if (!twObject) throw new Error(`Class "${twClass}" not found.`);

    let styleRoot: postcss.Root = twObject.root;

    const twClassVariantsLength = twClassVariants.length;
    if (twClassVariantsLength) {
      if (twObject.type !== "utility") {
        throw new Error(
          `Variant class "${twClassVariants.join(
            ", "
          )}" not allowed with class "${twClass}" of type "${twObject.type}"`
        );
      }

      if (twClassVariantsLength > 2) {
        throw new Error(
          `Variant classes "${twClassVariants.join(
            ", "
          )}" not allowed, expect max 2 variants but got "${twClassVariantsLength}"`
        );
      }

      if (
        twClassVariantsLength === 2 &&
        twClassVariants.every((variant) => variants.includes(variant))
      ) {
        throw new Error(
          `Variant classes "${twClassVariants.join(", ")}" not allowed`
        );
      }

      const variantCacheKey = twClassVariants.join();
      if (!twObject.variant) {
        twObject.variant = {};
      }
      if (twObject.variant[variantCacheKey]) {
        styleRoot = twObject.variant[variantCacheKey];
      } else {
        for (const variant of twClassVariants) {
          if (screens.includes(variant)) {
            const atRuleProps = {
              name: "screen",
              params: variant,
            };
            styleRoot = applySubstituteRules(
              atRuleProps,
              styleRoot,
              getSubstituteScreenAtRules
            );
            continue;
          }

          if (variants.includes(variant)) {
            const atRuleProps = {
              name: "variants",
              params: variant,
            };
            styleRoot = applySubstituteRules(
              atRuleProps,
              styleRoot,
              getSubstituteVariantsAtRules
            );
            styleRoot.first?.remove();
            continue;
          }

          throw new Error(`Utility with variant class '${variant}' not found"`);
        }

        twObject.variant[variantCacheKey] = styleRoot;
        twObjectMap.set(twClass, twObject);
      }
    }

    merge(mergedStyleObject, getStyleObjectFromTwObject(styleRoot, twClass));
  }

  return sortStyleObject(mergedStyleObject);
}
