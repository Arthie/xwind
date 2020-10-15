import { root, Root, atRule, AtRuleProps } from "postcss";
import { TwObject } from "./transformPostcssRootsToTwObjectMap";

function applySubstituteRules(
  variant: AtRuleProps,
  twObjectRoot: Root,
  getSubstituteRules: (root: Root) => void
) {
  if (!twObjectRoot.nodes) {
    throw new Error("Root has no nodes");
  }
  const atRuleNode = atRule(variant);
  atRuleNode.append(twObjectRoot.clone().nodes);
  const rootNode = root().append(atRuleNode);
  getSubstituteRules(rootNode);
  return rootNode;
}

export function getGenerateTwClassSubstituteRoot(
  screens: string[],
  getSubstituteScreenAtRules: (root: Root) => void,
  getSubstituteVariantsAtRules: (root: Root) => void
) {
  return (
    twObjectMap: Map<string, TwObject>,
    twParsedClass: [string, string[]]
  ) => {
    const [twClass, twClassVariants] = twParsedClass;
    const twObject = twObjectMap.get(twClass);
    if (!twObject) throw new Error(`Class "${twClass}" not found.`);

    let styleRoot = twObject.root.clone();
    const twClassVariantsLength = twClassVariants.length;
    if (twClassVariantsLength) {
      const variantCacheKey = twClassVariants.join();
      if (twObject.variant[variantCacheKey]) {
        styleRoot = twObject.variant[variantCacheKey].clone();
      } else {
        for (const variant of twClassVariants) {
          if (screens.includes(variant)) {
            const atRuleProps = {
              name: "screen",
              params: variant,
            };
            styleRoot = applySubstituteRules(
              atRuleProps,
              styleRoot,
              getSubstituteScreenAtRules
            );
          } else {
            const atRuleProps = {
              name: "variants",
              params: variant,
            };
            styleRoot = applySubstituteRules(
              atRuleProps,
              styleRoot,
              getSubstituteVariantsAtRules
            );
            styleRoot.first?.remove();
          }
        }

        twObject.variant[variantCacheKey] = styleRoot;
        twObjectMap.set(twClass, twObject);
      }
    }
    return styleRoot;
  };
}
