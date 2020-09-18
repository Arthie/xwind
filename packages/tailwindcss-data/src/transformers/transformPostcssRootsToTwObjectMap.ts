import { root, atRule, AtRule, Root, Rule } from "postcss";
import parser from "postcss-selector-parser";

export interface TwObject {
  variant: {
    [key: string]: Root;
  };
  twClass: string;
  nodes: Array<Rule | AtRule>;
}

export function transformPostcssRootsToTwObjectMap(roots: Root[] = []) {
  const combinedRoot = root().append(...roots);
  const selectorparser = parser();

  const parseSelectorClasses = (rule: Rule) => {
    let selectorClasses: string[] = [];
    selectorparser.astSync(rule.selector).walkClasses((ruleClass) => {
      if (ruleClass.value) selectorClasses.push(ruleClass.value);
    });
    return selectorClasses;
  };

  const addNodeToClassNodes = (
    classNodes: {
      [key: string]: TwObject;
    },
    node: Rule | AtRule,
    twClass: string
  ) => {
    if (classNodes[twClass]) {
      classNodes[twClass].nodes.push(node);
    } else {
      classNodes[twClass] = {
        variant: {},
        nodes: [node],
        twClass,
      };
    }
  };

  const classNodes: {
    [key: string]: TwObject;
  } = {};
  combinedRoot.walk((node) => {
    if (node.type === "atrule") {
      if (node.name === "layer") {
        node.remove();
      } else if (node.name === "variants") {
        node.remove();
      } else if (node.name === "media") {
        const isMediaAtRule = (mediaAtRule: AtRule) => {
          const selectorClassesAtRule: {
            selectorClass: string;
            atRule: AtRule;
          }[] = [];
          for (const node of mediaAtRule.nodes ?? []) {
            if (node.type === "rule") {
              const [selectorClass] = parseSelectorClasses(node);
              const atRuleNode = atRule({
                name: mediaAtRule.name,
                params: mediaAtRule.params,
                nodes: [node],
              });
              selectorClassesAtRule.push({
                atRule: atRuleNode,
                selectorClass: selectorClass,
              });
            }
            if (node.type === "atrule") {
              for (const {
                atRule: nestedAtRule,
                selectorClass,
              } of isMediaAtRule(node)) {
                const atRuleNode = atRule({
                  name: mediaAtRule.name,
                  params: mediaAtRule.params,
                });
                atRuleNode.append(nestedAtRule);
                selectorClassesAtRule.push({
                  atRule: atRuleNode,
                  selectorClass,
                });
              }
            }
          }
          return selectorClassesAtRule;
        };

        const mediaAtRule = node.clone();
        node.removeAll();
        for (const { atRule, selectorClass } of isMediaAtRule(mediaAtRule)) {
          addNodeToClassNodes(classNodes, atRule, selectorClass);
        }
      } else {
        //remove other atRules e.g. @keyframes
        node.removeAll();
      }
    }

    if (node.type === "rule") {
      const rule = node.clone();
      node.removeAll();
      const [selectorClass] = parseSelectorClasses(node);
      addNodeToClassNodes(classNodes, rule, selectorClass);
    }
  });

  return new Map<string, TwObject>(Object.entries(classNodes));
}
