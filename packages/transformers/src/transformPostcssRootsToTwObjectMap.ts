import postcss, { AtRule, Root, Rule } from "postcss";
import { parseTwSelectorClass } from "./parseTwSelectorClass";

export interface TwObject {
  variant: {
    [key: string]: Root;
  };
  twClass: string;
  nodes: Array<Rule | AtRule>;
}

export function transformPostcssRootsToTwObjectMap(roots: Root[] = []) {
  const combinedRoot = postcss.root().append(...roots);

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
        const mediaAtRule = node.clone();
        node.removeAll();
        if (mediaAtRule.nodes?.length && mediaAtRule.nodes.length > 1) {
          throw new Error("mediaAtRule has multiple rules");
        }
        const firstNode = mediaAtRule.first;
        if (firstNode?.type !== "rule") {
          throw new Error("mediaAtRule first node is not a rule");
        }
        const selectorClass = parseTwSelectorClass(firstNode.selector);
        addNodeToClassNodes(classNodes, mediaAtRule, selectorClass);
      } else {
        //remove other atRules e.g. @keyframes
        node.removeAll();
      }
    }

    if (node.type === "rule") {
      const rule = node.clone();
      node.removeAll();
      const selectorClass = parseTwSelectorClass(node.selector);
      addNodeToClassNodes(classNodes, rule, selectorClass);
    }
  });

  return new Map<string, TwObject>(Object.entries(classNodes));
}
