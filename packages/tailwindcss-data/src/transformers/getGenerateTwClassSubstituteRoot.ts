import postcss, { Root, AtRuleNewProps } from "postcss";
import { TwObject } from "./transformPostcssRootsToTwObjectMap";

function applySubstituteRules(
  variant: AtRuleNewProps,
  twObjectRoot: Root,
  getSubstituteRules: (root: Root) => void
) {
  if (!twObjectRoot.nodes) {
    throw new Error("Root has no nodes");
  }
  const atRule = postcss.atRule(variant);
  for (const node of twObjectRoot.nodes) {
    atRule.append(node.clone());
  }
  const root = postcss.root().append(atRule);
  getSubstituteRules(root);
  return root;
}

export function getGenerateTwClassSubstituteRoot(
  screens: string[],
  variants: string[],
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

    let styleRoot = postcss.root().append(...twObject.nodes);
    const twClassVariantsLength = twClassVariants.length;
    if (twClassVariantsLength) {
      if (
        twClassVariantsLength >= 2 &&
        twClassVariants.every(
          (variant) => variants.includes(variant) && !variant.includes("motion")
        )
      ) {
        throw new Error(
          `Variant classes "${twClassVariants.join(", ")}" not allowed`
        );
      }

      const variantCacheKey = twClassVariants.join();
      if (twObject.variant[variantCacheKey]) {
        styleRoot = twObject.variant[variantCacheKey];
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
            continue;
          }

          if (variants.includes(variant)) {
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
            continue;
          }

          throw new Error(`Utility with variant class '${variant}' not found"`);
        }

        twObject.variant[variantCacheKey] = styleRoot;
        twObjectMap.set(twClass, twObject);
      }
    }
    return styleRoot;
  };
}
