import postcss, { Root, Rule } from "postcss";
import { parseTwSelectorClass } from "./parseTwSelector";

export type StyleObject = StyleObjectDecl | StyleObjectRuleOrAtRule;

export type StyleObjectDecl = {
  [key: string]: string | string[];
};

export type StyleObjectRuleOrAtRule = {
  [key: string]: string | string[] | StyleObjectRuleOrAtRule;
};

export interface TwObject {
  variant?: {
    [key: string]: Root;
  };
  root: Root;
  type: "utility" | "component";
  class: string;
}

export function transformPostcssRootToPostcssRules(root: Root) {
  const rules: Rule[] = [];
  root.walkRules((rule) => {
    rules.push(rule);
  });
  return rules;
}

function buildUtilityRoot(rule: Rule) {
  const root = postcss.root();
  root.append(rule.clone());
  return root;
}

function buildComponentRoot(rules: Rule[]) {
  const root = postcss.root();
  for (const rule of rules) {
    root.append(rule.root());
  }
  return root;
}

export function transformPostcssRulesToTwObjectMap(
  utilityRules: Rule[] = [],
  componentRules: Rule[] = []
) {
  const twObjectMap = new Map<string, TwObject>();

  for (const rule of utilityRules) {
    const ruleClass = parseTwSelectorClass(rule.selector);
    if (twObjectMap.has(ruleClass)) {
      throw new Error(
        `Utility with class: ${ruleClass} already exists. Utility classes can only have one rule.`
      );
    }
    const twObject: TwObject = {
      type: "utility",
      root: buildUtilityRoot(rule),
      class: ruleClass,
    };
    twObjectMap.set(ruleClass, twObject);
  }

  const componentRulesMap = new Map<string, Rule[]>();
  for (const componentRule of componentRules) {
    const ruleClass = parseTwSelectorClass(componentRule.selector);
    const prevComponentRules = componentRulesMap.get(ruleClass);
    if (prevComponentRules) {
      componentRulesMap.set(ruleClass, [...prevComponentRules, componentRule]);
    } else {
      componentRulesMap.set(ruleClass, [componentRule]);
    }
  }

  for (const [componentClass, componentRules] of componentRulesMap.entries()) {
    twObjectMap.set(componentClass, {
      type: "component",
      root: buildComponentRoot(componentRules),
      class: componentClass,
    });
  }

  return twObjectMap;
}
