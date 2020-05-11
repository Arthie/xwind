import { Root, Rule } from "postcss";
import { parseTwSelector } from "./parseTwSelector";

export type StyleObject = StyleObjectDecl | StyleObjectRuleOrAtRule;

export type StyleObjectDecl = {
  [key: string]: string | string[];
};

export type StyleObjectRuleOrAtRule = {
  [key: string]: string | string[] | StyleObjectRuleOrAtRule;
};

export interface TwObjectBase {
  styleObject?: StyleObject;
  variant?: {
    [key: string]: StyleObject;
  };
}

export interface TwObjectUtility extends TwObjectBase {
  type: "utility";
  rule: Rule;
}

export interface TwObjectComponent extends TwObjectBase {
  type: "component";
  rules: Rule[];
}

export type TwObject = TwObjectUtility | TwObjectComponent;

export function transformPostcssRootToPostcssRules(root: Root) {
  const rules: Rule[] = [];
  root.walkRules((rule) => {
    rules.push(rule);
  });
  return rules;
}

export function transformPostcssRulesToTwObjectMap(
  utilityRules: Rule[] = [],
  componentRules: Rule[] = []
) {
  const twObjectMap = new Map<string, TwObject>();

  for (const rule of utilityRules) {
    const parsedTwSelector = parseTwSelector(rule.selector);
    if (twObjectMap.has(parsedTwSelector.class)) {
      throw new Error(
        `Utility with class: ${parsedTwSelector.class} already exists. Utility classes can only have one rule.`
      );
    }
    twObjectMap.set(parsedTwSelector.class, {
      type: "utility",
      rule,
    });
  }

  for (const rule of componentRules) {
    const parsedTwSelector = parseTwSelector(rule.selector);
    const twObjectComponent = twObjectMap.get(parsedTwSelector.class);

    if (twObjectComponent?.type === "component") {
      twObjectComponent.rules.push(rule);
      twObjectMap.set(parsedTwSelector.class, twObjectComponent);
    } else {
      twObjectMap.set(parsedTwSelector.class, {
        type: "component",
        rules: [rule],
      });
    }
  }

  return twObjectMap;
}
