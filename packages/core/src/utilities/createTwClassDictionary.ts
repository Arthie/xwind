import {
  root,
  atRule,
  Root,
  Rule,
  Container,
  rule,
  AtRule,
  Comment,
  Declaration,
} from "postcss";
import parser from "postcss-selector-parser";

export interface TwRoot extends Root {
  twClass?: string;
}

interface TwAtrule extends AtRule {
  twClass?: string;
}

interface TwRule extends Rule {
  twClass?: string;
}

interface TwComment extends Comment {
  twClass?: string;
}

interface TwDeclaration extends Declaration {
  twClass?: string;
}

type TwChildNode = TwAtrule | TwRule | TwComment | TwDeclaration;

export interface TwClassDictionary {
  XWIND_GLOBAL: Root;
  [key: string]: TwRoot;
}

const XWIND_GLOBAL = "XWIND_GLOBAL";

export function createTwClassDictionary(...roots: Root[]) {
  const twClassDictionary: TwClassDictionary = {
    [XWIND_GLOBAL]: root(),
  };
  const addNodeToTwClassDictionary = (node: TwChildNode) => {
    const twClass = node.twClass ?? XWIND_GLOBAL;
    if (twClassDictionary[twClass]) {
      twClassDictionary[twClass].append(node.clone());
    } else {
      twClassDictionary[twClass] = root().append(node.clone());
      twClassDictionary[twClass].twClass = twClass;
    }
  };

  const combinedRoot = root();
  for (const twRoot of roots) {
    combinedRoot.append(twRoot.clone());
  }
  flattenContainer(combinedRoot);
  for (const node of combinedRoot.nodes) {
    addNodeToTwClassDictionary(node);
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

  const walker = (node: TwChildNode) => {
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
        for (const atRulenode of node.nodes as TwChildNode[]) {
          const newAtrule = atRule({
            name: node.name,
            nodes: [atRulenode],
            params: node.params,
            raws: node.raws,
            source: node.source,
          }) as TwAtrule;
          newAtrule.twClass = atRulenode.twClass;
          node.parent?.append(newAtrule);
        }
        node.removeAll();
        node.remove();
      }
    } else if (node.type === "rule") {
      const selectorClasses = parseSelectorClasses(node);
      // is Single Class Selector
      if (selectorClasses.length === 1) {
        node.twClass = selectorClasses[0];
      }

      // is Multi Classes Selector
      if (selectorClasses.length > 1) {
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
          }) as TwRule;
          newRule.twClass = selectorClass;
          node.parent?.append(newRule);
        }
        node.removeAll();
        node.remove();
      }
    }
  };

  container.walk(walker);
}
