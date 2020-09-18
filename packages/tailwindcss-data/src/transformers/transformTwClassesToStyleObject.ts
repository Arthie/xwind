import { Root } from "postcss";
//@ts-expect-error postcss-js has no type definition
import { objectify } from "postcss-js";
import merge from "lodash/merge";
import sortCSSmq from "sort-css-media-queries";
import parser from "postcss-selector-parser";

import { TwObject } from "./transformPostcssRootsToTwObjectMap";

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
      return "rule";
    }

    if (type === "number") {
      return "decl";
    }

    throw new Error(`This type: ${type} of value: ${value} is not supported`);
  };

  const sortedStyleObjectEntries = styleObjectEntries.sort(
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

  return Object.fromEntries(sortedStyleObjectEntries);
}

export function transformTwClassesToStyleObjects(
  twObjectMap: Map<string, TwObject>,
  parsedTwClasses: [string, string[]][],
  generateTwClassesRoot: (
    twObjectMap: Map<string, TwObject>,
    parsedTwClass: [string, string[]]
  ) => Root
) {
  const styleObjects: StyleObject[] = [];

  for (const [twClass, twClassVariants] of parsedTwClasses) {
    const styleRoot = generateTwClassesRoot(twObjectMap, [
      twClass,
      twClassVariants,
    ]);

    styleObjects.push(getStyleObjectFromTwObject(styleRoot, twClass));
  }

  return styleObjects;
}

export function transformTwClassesToStyleObject(
  twObjectMap: Map<string, TwObject>,
  parsedTwClasses: [string, string[]][],
  generateTwClassesRoot: (
    twObjectMap: Map<string, TwObject>,
    parsedTwClass: [string, string[]]
  ) => Root
) {
  const styleObjects = transformTwClassesToStyleObjects(
    twObjectMap,
    parsedTwClasses,
    generateTwClassesRoot
  );

  const mergedStyleObject = merge({}, ...styleObjects);

  return sortStyleObject(mergedStyleObject);
}
