import { Root } from "postcss";
import merge from "lodash/merge";

import { TwObject } from "./transformPostcssRootsToTwObjectMap";
import objectify from "./postcssjs-objectify";
import { unescapeCSS } from "./parseTwSelectorClass";

export type StyleObject = StyleObjectDecl | StyleObjectRuleOrAtRule;

export type StyleObjectDecl = {
  [key: string]: string | string[];
};

export type StyleObjectRuleOrAtRule = {
  [key: string]: string | string[] | StyleObjectRuleOrAtRule;
};

function getStyleObjectFromTwObject(
  twObjectRoot: Root,
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

  const sortedStyleObjectEntries = styleObjectEntries.sort(
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

  return Object.fromEntries(sortedStyleObjectEntries);
}

export function transformTwClassesToStyleObject(
  twObjectMap: Map<string, TwObject>,
  twParsedClasses: [string, string[]][],
  generateTwClassesRoot: (
    twObjectMap: Map<string, TwObject>,
    twParsedClass: [string, string[]]
  ) => Root
) {
  const mergedStyleObject: StyleObject = {};

  for (const [twClass, twClassVariants] of twParsedClasses) {
    const styleRoot = generateTwClassesRoot(twObjectMap, [
      twClass,
      twClassVariants,
    ]);

    merge(mergedStyleObject, getStyleObjectFromTwObject(styleRoot, twClass));
  }

  return sortStyleObject(mergedStyleObject);
}
