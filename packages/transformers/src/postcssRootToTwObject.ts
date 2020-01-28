import { Root } from "postcss"
import postcssJs from "postcss-js"
import { TwObject } from "./transformTypes"

export const transformPostcssRootToTwObject = (root: Root) => {
  const twObjects: TwObject[] = []
  root.walkRules(rule => {
    const selector = rule.selector
    const decls = postcssJs.objectify(rule)
    if (rule.parent.type === "atrule") {
      if (rule.parent.name === "media") {
        twObjects.push({
          selector,
          decls,
          atRule: `@media ${rule.parent.params}`
        })
      }

      if (rule.parent.name === "variants") {
        twObjects.push({
          selector,
          decls,
          variants: rule.parent.params.split(", ")
        })
      }
    } else {
      twObjects.push({
        selector,
        decls
      })
    }
  })
  return twObjects
}
