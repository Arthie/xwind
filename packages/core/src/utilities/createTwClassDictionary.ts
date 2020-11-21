import {
  root,
  atRule,
  AtRule,
  Root,
  Rule,
  Container,
  ChildNode,
  rule,
} from "postcss";
import parser from "postcss-selector-parser";

export interface TwClassDictionary {
  [key: string]: Root;
}

export function createTwClassDictionary(...roots: Root[]) {
  const twClassDictionary: TwClassDictionary = {};
  const addNodeToTwClassDictionary = (node: Rule | AtRule, twClass: string) => {
    if (twClassDictionary[twClass]) {
      twClassDictionary[twClass].append(node.clone());
    } else {
      twClassDictionary[twClass] = root().append(node.clone());
    }
  };

  const combinedRoot = root();
  for (const twRoot of roots) {
    combinedRoot.append(twRoot.clone());
  }
  flattenContainer(combinedRoot);
  for (const node of combinedRoot.nodes) {
    //@ts-expect-error
    addNodeToTwClassDictionary(node, node.twClass);
  }
  return twClassDictionary;
}

export function flattenContainer(container: Container) {
  const selectorparser = parser();
  const parseSelectorClasses = (rule: Rule) => {
    let selectorClasses: Array<string> = [];
    selectorparser.astSync(rule.selector).walkClasses((ruleClass) => {
      if (ruleClass.value) selectorClasses.push(ruleClass.value);
    });
    return Array.from(new Set(selectorClasses));
  };

  const walker = (node: ChildNode) => {
    //@ts-expect-error
    if (node?.twClass) {
      return;
    }
    if (node.type === "atrule") {
      if (node.name === "layer") {
        node.parent?.append(node.nodes);
        node.removeAll();
        node.remove();
      } else if (node.name === "variants") {
        node.parent?.append(node.nodes);
        node.removeAll();
        node.remove();
      } else if (node.name === "media") {
        node.walk(walker);
        for (const atRulenode of node.nodes) {
          const newAtrule = atRule({
            name: node.name,
            nodes: [atRulenode],
            params: node.params,
            raws: node.raws,
            source: node.source,
          });
          //@ts-expect-error
          newAtrule.twClass = atRulenode.twClass;
          node.parent?.append(newAtrule);
        }
        node.removeAll();
        node.remove();
      } else {
        //@ts-expect-error
        node.twClass = "_REMAINDER";
      }
    } else if (node.type === "rule") {
      const selectorClasses = parseSelectorClasses(node);

      const isNoClassSelector = selectorClasses.length === 0;
      const isSingleClassSelector = selectorClasses.length === 1;
      const isMultiSelector = selectorClasses.length > 1;

      if (isSingleClassSelector) {
        //@ts-expect-error
        node.twClass = selectorClasses[0];
      }

      if (isNoClassSelector) {
        //@ts-expect-error
        node.twClass = "_REMAINDER";
      }

      if (isMultiSelector) {
        const isClassInSelector = (selector: string, twClass: string) => {
          let isInSelector = false;
          selectorparser.astSync(selector).walkClasses((selectorClass) => {
            if (selectorClass.value === twClass) isInSelector = true;
          });
          return isInSelector;
        };
        for (const selectorClass of selectorClasses) {
          const selectors = node.selectors.filter((selector) =>
            isClassInSelector(selector, selectorClass)
          );
          const newRule = rule({
            nodes: node.nodes,
            raws: node.raws,
            selectors,
            source: node.source,
          });
          //@ts-expect-error
          newRule.twClass = selectorClass;
          node.parent?.append(newRule);
        }
        node.removeAll();
        node.remove();
      }
    } else {
      //@ts-expect-error
      node.twClass = "_REMAINDER";
    }
  };

  container.walk(walker);
}
