import postcss from "postcss";
import { TwObject } from "./transformPostcss";

function applySubstituteRules(
  variant: postcss.AtRuleNewProps,
  twObjectRoot: postcss.Root,
  getSubstituteRules: (root: postcss.Root) => void
) {
  const root = twObjectRoot.clone();
  if (!root.first || root.first.type !== "rule") {
    throw new Error(`Root's first node is not of type 'rule' ${root}`);
  }
  const atRule = postcss.atRule(variant);
  atRule.append(root.first.clone());
  root.first.replaceWith(atRule);

  getSubstituteRules(root);
  return root;
}

export function getGenerateTwClassSubstituteRoot(
  screens: string[],
  variants: string[],
  getSubstituteScreenAtRules: (root: postcss.Root) => void,
  getSubstituteVariantsAtRules: (root: postcss.Root) => void
) {
  return (
    twObjectMap: Map<string, TwObject>,
    twParsedClass: [string, string[]]
  ) => {
    const [twClass, twClassVariants] = twParsedClass;
    const twObject = twObjectMap.get(twClass);
    if (!twObject) throw new Error(`Class "${twClass}" not found.`);

    let styleRoot: postcss.Root = twObject.root;

    const twClassVariantsLength = twClassVariants.length;
    if (twClassVariantsLength) {
      if (twObject.type !== "utility") {
        throw new Error(
          `Variant class "${twClassVariants.join(
            ", "
          )}" not allowed with class "${twClass}" of type "${twObject.type}"`
        );
      }

      if (twClassVariantsLength > 2) {
        throw new Error(
          `Variant classes "${twClassVariants.join(
            ", "
          )}" not allowed, expect max 2 variants but got "${twClassVariantsLength}"`
        );
      }

      if (
        twClassVariantsLength === 2 &&
        twClassVariants.every((variant) => variants.includes(variant))
      ) {
        throw new Error(
          `Variant classes "${twClassVariants.join(", ")}" not allowed`
        );
      }

      const variantCacheKey = twClassVariants.join();
      if (!twObject.variant) {
        twObject.variant = {};
      }
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
