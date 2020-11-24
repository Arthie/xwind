import { Root } from "postcss";
//@ts-expect-error postcss-js has no type definition
import { objectify } from "postcss-js";
import merge from "lodash/merge";
import sortCSSmq from "sort-css-media-queries";
import parser from "postcss-selector-parser";

export type Objectstyle = ObjectstyleDecl | ObjectstyleRuleOrAtRule;

export type ObjectstyleDecl = {
  [key: string]: string | string[];
};

export type ObjectstyleRuleOrAtRule = {
  [key: string]: string | string[] | ObjectstyleRuleOrAtRule;
};

export function transformTwRootToObjectstyle(
  twClass: string,
  twRoot: Root
): Objectstyle {
  const processor = parser((root) => {
    root.walkClasses((node) => {
      if (node.value?.endsWith(twClass)) {
        node.replaceWith(parser.nesting({}));
      }
    });
  });
  const root = twRoot.clone();
  root.walkRules((rule) => {
    if (!rule.nodes) {
      throw new Error(`Rule has no nodes ${root}`);
    }
    rule.selector = processor.processSync(rule.selector);
    if (rule.selector === "&") {
      rule.replaceWith(rule.nodes);
    }
  });
  return objectify(root);
}

function sortObjectstyle<T extends Objectstyle>(objectStyle: T) {
  const objectStyleEntries = Object.entries(objectStyle);

  //also sort nested style Rules / atRules
  for (const [index, [key, value]] of objectStyleEntries.entries()) {
    if (typeof value === "object" && !Array.isArray(value)) {
      const sortedValue = sortObjectstyle<ObjectstyleRuleOrAtRule>(value);
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

  const sortedObjectstyleEntries = objectStyleEntries.sort(
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

  return Object.fromEntries(sortedObjectstyleEntries);
}

export function mergeObjectstyles(objectStyles: Objectstyle[]) {
  const mergedObjectstyle = merge({}, ...objectStyles);

  return sortObjectstyle(mergedObjectstyle);
}
