import { root, atRule, AtRule, Root, Rule } from "postcss";
import parser from "postcss-selector-parser";

export interface TwClassDictionary {
  [key: string]: Root;
}

export function createTwClassDictionary(...roots: Root[]) {
  const twClassDictionary: TwClassDictionary = {};
  const combinedRoot = root();
  for (const twRoot of roots) {
    combinedRoot.append(twRoot.clone());
  }

  const selectorparser = parser();
  const parseSelectorClasses = (rule: Rule) => {
    let selectorClasses: string[] = [];
    selectorparser.astSync(rule.selector).walkClasses((ruleClass) => {
      if (ruleClass.value) selectorClasses.push(ruleClass.value);
    });
    return selectorClasses;
  };

  const addNodeToTwClassDictionary = (node: Rule | AtRule, twClass: string) => {
    if (twClassDictionary[twClass]) {
      twClassDictionary[twClass].append(node.clone());
    } else {
      twClassDictionary[twClass] = root().append(node.clone());
    }
  };

  const isMediaAtRule = (mediaAtRule: AtRule) => {
    const selectorClassAtRules: [string, AtRule][] = [];
    const atRuleNode = atRule({
      name: mediaAtRule.name,
      params: mediaAtRule.params,
    });
    for (const $node of mediaAtRule.nodes ?? []) {
      const node = $node.clone();
      if (node.type === "atrule") {
        for (const [selectorClass, nestedAtRule] of isMediaAtRule(node)) {
          const selectorAtRuleNode = atRuleNode.clone().append(nestedAtRule);
          selectorClassAtRules.push([selectorClass, selectorAtRuleNode]);
        }
      }
      if (node.type === "rule") {
        const [selectorClass] = parseSelectorClasses(node);
        const selectorAtRuleNode = atRuleNode.clone().append(node);
        selectorClassAtRules.push([selectorClass, selectorAtRuleNode]);
      }
    }
    return selectorClassAtRules;
  };

  combinedRoot.walk((node) => {
    if (node.type === "atrule") {
      if (node.name === "layer") {
        node.remove();
      } else if (node.name === "variants") {
        node.remove();
      } else if (node.name === "media") {
        for (const [selectorClass, atRule] of isMediaAtRule(node)) {
          addNodeToTwClassDictionary(atRule, selectorClass);
        }
        node.removeAll();
      } else {
        //remove other atRules e.g. @keyframes
        node.removeAll();
      }
    }

    if (node.type === "rule") {
      const [selectorClass] = parseSelectorClasses(node);
      addNodeToTwClassDictionary(node, selectorClass);
      node.removeAll();
    }
  });

  return twClassDictionary;
}
