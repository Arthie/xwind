import { Root } from "postcss";
//@ts-expect-error postcss-js has no type definition
import { objectify } from "postcss-js";
import merge from "lodash/merge";
import sortCSSmq from "sort-css-media-queries";
import parser from "postcss-selector-parser";

import { TwObject } from "./transformPostcssRootsToTwObjectMap";

export type ObjectStyle = ObjectStyleDecl | ObjectStyleRuleOrAtRule;

export type ObjectStyleDecl = {
  [key: string]: string | string[];
};

export type ObjectStyleRuleOrAtRule = {
  [key: string]: string | string[] | ObjectStyleRuleOrAtRule;
};

function getObjectStyleFromTwObject(
  twObjectRoot: Root,
  twClass: string
): ObjectStyle {
  const processor = parser((root) => {
    root.walkClasses((node) => {
      if (node.value?.endsWith(twClass)) {
        node.replaceWith(parser.nesting({}));
      }
    });
  });
  const root = twObjectRoot.clone();
  root.walkRules((rule) => {
    if (rule.nodes) {
      rule.selector = processor.processSync(rule.selector);
      if (rule.selector === "&") {
        rule.replaceWith(rule.nodes);
      }
    } else {
      throw new Error(`Rule has no nodes ${root}`);
    }
  });
  return objectify(root);
}

function sortObjectStyle<T extends ObjectStyle>(objectStyle: T) {
  const objectStyleEntries = Object.entries(objectStyle);

  //also sort nested style Rules / atRules
  for (const [index, [key, value]] of objectStyleEntries.entries()) {
    if (typeof value === "object" && !Array.isArray(value)) {
      const sortedValue = sortObjectStyle<ObjectStyleRuleOrAtRule>(value);
      objectStyleEntries[index] = [key, sortedValue];
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
      return "rule";
    }

    if (type === "number") {
      return "decl";
    }

    throw new Error(`This type: ${type} of value: ${value} is not supported`);
  };

  const sortedObjectStyleEntries = objectStyleEntries.sort(
    ([first, firstValue], [second, secondValue]) => {
      const firstValueType = getValueType(first, firstValue);
      const secondValueType = getValueType(second, secondValue);

      const firstIsDecl = firstValueType.startsWith("decl");
      const secondIsDecl = secondValueType.startsWith("decl");
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

      const firstIsAtRule = firstValueType === "atRule";
      const secondIsAtRule = secondValueType === "atRule";
      if (firstIsAtRule && secondIsAtRule) {
        return sortCSSmq(first, second);
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

  return Object.fromEntries(sortedObjectStyleEntries);
}

export function transformTwClassesToObjectStyles(
  twObjectMap: Map<string, TwObject>,
  parsedTwClasses: [string, string[]][],
  generateTwClassesRoot: (
    twObjectMap: Map<string, TwObject>,
    parsedTwClass: [string, string[]]
  ) => Root
) {
  const objectStyles: ObjectStyle[] = [];

  for (const [twClass, twClassVariants] of parsedTwClasses) {
    const styleRoot = generateTwClassesRoot(twObjectMap, [
      twClass,
      twClassVariants,
    ]);

    objectStyles.push(getObjectStyleFromTwObject(styleRoot, twClass));
  }

  return objectStyles;
}

export function transformTwClassesToObjectStyle(
  twObjectMap: Map<string, TwObject>,
  parsedTwClasses: [string, string[]][],
  generateTwClassesRoot: (
    twObjectMap: Map<string, TwObject>,
    parsedTwClass: [string, string[]]
  ) => Root
) {
  const objectStyles = transformTwClassesToObjectStyles(
    twObjectMap,
    parsedTwClasses,
    generateTwClassesRoot
  );

  const mergedObjectStyle = merge({}, ...objectStyles);

  return sortObjectStyle(mergedObjectStyle);
}
