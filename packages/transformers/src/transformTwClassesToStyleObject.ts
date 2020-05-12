import postcss, { Rule, AtRule, Root } from "postcss";
import merge from "lodash/merge";
//@ts-ignore
const timsort = require("timsort");

import {
  TwObject,
  TwObjectUtility,
  StyleObject,
  StyleObjectRuleOrAtRule,
} from "./transformPostcss";

//@ts-ignore
import objectify from "./postcssjs-objectify";

import { parseTwSelector } from "./parseTwSelector";

function getStyleObjectFromRule(rule: Rule): StyleObject {
  const parent = rule.parent;
  let styleObject = objectify(rule);

  const selector = parseTwSelector(rule.selector);
  if (selector.remainder) {
    styleObject = { [`&${selector.remainder}`]: styleObject };
  }

  const applyMedia = (parent: AtRule) => {
    const atRule = `@media ${parent.params}`;
    styleObject = { [atRule]: styleObject };

    if (parent.parent.type === "atrule" && parent.parent.name === "media") {
      applyMedia(parent.parent);
    }
  };

  if (parent.type === "atrule" && parent.name === "media") {
    applyMedia(parent);
  }

  return styleObject;
}

function getStyleObjectFromTwObject(twObject: TwObject): StyleObject {
  if (twObject.type === "utility") {
    return getStyleObjectFromRule(twObject.rule);
  }

  if (twObject.type === "component") {
    const styleObjects = twObject.rules.map((rule) =>
      getStyleObjectFromRule(rule)
    );
    return merge({}, ...styleObjects);
  }

  throw new Error(`Tailwind Object type is not supported | ${twObject}`);
}

function applyTwClassVariants(
  variant: string,
  styleObject: StyleObject,
  twObject: TwObjectUtility,
  mediaScreens: {
    [key: string]: string;
  },
  variants: string[],
  getSubstituteVariantsAtRules: (root: Root) => void
): StyleObject {
  let variantStyleObject = styleObject;
  if (
    twObject.rule.parent.type === "atrule" &&
    twObject.rule.parent.name === "variants" &&
    twObject.rule.parent.params.split(", ").includes("responsive") &&
    Object.keys(mediaScreens).includes(variant)
  ) {
    variantStyleObject = {
      [`@media ${mediaScreens[variant]}`]: variantStyleObject,
    };
    return variantStyleObject;
  }

  if (variants.includes(variant)) {
    const root = postcss.parse(
      `@variants ${variant} {${twObject.rule.toString()}}`,
      { from: undefined }
    );

    getSubstituteVariantsAtRules(root);

    let variantRule: any; //postcss.Rule;
    root.walkRules((rule) => {
      if (rule.selector === twObject.rule.selector) {
        rule.remove();
      } else {
        const parsed = parseTwSelector(twObject.rule.selector);
        rule.selector = rule.selector.replace(
          new RegExp(`\\S*${parsed.class}`, "g"),
          "&"
        );
        variantRule = rule;
      }
    });

    variantStyleObject = {
      [variantRule.selector]: objectify(variantRule),
    };

    if (variantRule.parent.type === "atrule") {
      const atRule = `@${variantRule.parent.name} ${variantRule.parent.params}`;
      variantStyleObject = {
        [atRule]: variantStyleObject,
      };
    }
    return variantStyleObject;
  }
  throw new Error(`Utility with variant class '${variant}' not found"`);
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

function removefallbacks(styleObject: StyleObject): StyleObject {
  const rules = Object.entries(styleObject).map(([key, value]) => {
    if (typeof value === "string") {
      return [key, value];
    }
    if (Array.isArray(value)) {
      return [key, value.pop()];
    } else {
      return [key, removefallbacks(value)];
    }
  });
  return Object.fromEntries(rules);
}

export function transformTwClassesToStyleObject(
  twObjectMap: Map<string, TwObject>,
  twParsedClasses: [string, string[]][],
  mediaScreens: {
    [key: string]: string;
  },
  variants: string[],
  getSubstituteVariantsAtRules: (root: Root) => void,
  options: { fallbacks: boolean } = { fallbacks: true }
) {
  const mergedStyleObject: StyleObject = {};

  twParsedClasses.forEach(([twClass, twClassVariants]) => {
    const twObject = twObjectMap.get(twClass);

    if (twObject) {
      let styleObject: StyleObject;

      //check if styleObject is cached
      if (twObject.styleObject) {
        styleObject = twObject.styleObject;
      } else {
        styleObject = getStyleObjectFromTwObject(twObject);
        twObject.styleObject;
        twObjectMap.set(twClass, twObject);
      }

      if (twClassVariants.length) {
        if (twObject.type !== "utility") {
          throw new Error(
            `Variant class "${twClassVariants.join(
              ", "
            )}" not allowed with class "${twClass}" of type "${twObject.type}"`
          );
        }

        //TODO check if variants are possible
        // ??? md:hover:space-x-2
        // ??? hover:focus:text-red-200
        //add to twStyleOcject if it has selector state, if it does merge those selectors eg with comma
        const variantCacheKey = twClassVariants.join();
        if (twObject.variant && twObject.variant[variantCacheKey]) {
          styleObject = twObject.variant[variantCacheKey];
        } else {
          let variantStyleObject: StyleObject = styleObject;
          for (const variant of twClassVariants) {
            variantStyleObject = applyTwClassVariants(
              variant,
              variantStyleObject,
              twObject,
              mediaScreens,
              variants,
              getSubstituteVariantsAtRules
            );
          }
          if (!twObject.variant) {
            twObject.variant = {};
          }
          twObject.variant[variantCacheKey] = variantStyleObject;
          twObjectMap.set(twClass, twObject);
          styleObject = variantStyleObject;
        }
      }

      merge(mergedStyleObject, styleObject);
    } else {
      throw new Error(`Class "${twClass}" not found.`);
    }
  });

  const sortedStyleObject = sortStyleObject(mergedStyleObject);

  if (!options.fallbacks) {
    return removefallbacks(sortedStyleObject);
  }

  return sortedStyleObject;
}
