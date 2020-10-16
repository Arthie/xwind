import { Root, atRule, AtRuleProps } from "postcss";
import { TwClassDictionary } from "./createTwClassDictionary";

export function getGenerateTwClassSubstituteRoot(
  screens: string[],
  getSubstituteScreenAtRules: (root: Root) => void,
  getSubstituteVariantsAtRules: (root: Root) => void
) {
  const applySubstituteRules = (
    variant: AtRuleProps,
    twRoot: Root,
    getSubstituteRules: (root: Root) => void
  ) => {
    if (!twRoot.nodes) {
      throw new Error("Root has no nodes");
    }
    const atRuleNode = atRule(variant).append(twRoot.nodes);
    twRoot.removeAll().append(atRuleNode);
    getSubstituteRules(twRoot);
  };

  return (
    twClassDictionary: TwClassDictionary,
    twParsedClass: [string, string[]]
  ) => {
    const [twClass, twClassVariants] = twParsedClass;
    const twObject = twClassDictionary[twClass];
    if (!twObject) throw new Error(`Class "${twClass}" not found.`);
    const twRoot = twObject.clone();
    if (twClassVariants.length) {
      for (const variant of twClassVariants) {
        if (screens.includes(variant)) {
          const atRuleProps = {
            name: "screen",
            params: variant,
          };
          applySubstituteRules(atRuleProps, twRoot, getSubstituteScreenAtRules);
        } else {
          const atRuleProps = {
            name: "variants",
            params: variant,
          };
          applySubstituteRules(
            atRuleProps,
            twRoot,
            getSubstituteVariantsAtRules
          );
          twRoot.first?.remove();
        }
      }
    }

    return twRoot;
  };
}
