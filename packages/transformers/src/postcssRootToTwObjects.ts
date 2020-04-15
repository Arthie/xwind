import { Root } from "postcss";
import { TwObject } from "./transformersTypes";

//@ts-ignore
import objectify from "./postcssjs-objectify";

export const transformPostcssRootToTwObjects = (root: Root, type: string) => {
  const twObjects: TwObject[] = [];
  root.walkRules((rule) => {
    const selector = rule.selector;
    const decls = objectify(rule);
    if (rule.parent.type === "atrule") {
      if (rule.parent.name === "media") {
        twObjects.push({
          selector,
          decls,
          atRule: `@media ${rule.parent.params}`,
          type,
        });
      }

      if (rule.parent.name === "variants") {
        twObjects.push({
          selector,
          decls,
          variants: rule.parent.params.split(", "),
          type,
        });
      }
    } else {
      twObjects.push({
        selector,
        decls,
        type,
      });
    }
  });
  return twObjects;
};
