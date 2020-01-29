import merge from "lodash/merge"
import { TwCssObject, AtRule, Rule } from "./transformerTypes"

const getPseudoClass = (pseudoPrefix: string, classPrefix: string) => {
  switch (pseudoPrefix) {
    case "first":
      return "&:first-child"
    case "last":
      return "&:last-child"
    case "odd":
      return "&:nth-child(odd)"
    case "even":
      return "&:nth-child(even)"
    case "group-hover":
      return `.${classPrefix}group:hover &`
    default:
      //#other PseuldoClasses:
      //hover
      //focus
      //active
      //disabled
      //visited
      //focus-within
      return `&:${pseudoPrefix}`
  }
}

export const applyVariants = (
  twCssObject: TwCssObject,
  variants: string[],
  mediaScreens: {
    [key: string]: string
  },
  classPrefix: string
) => {
  let variantTwCssObject = twCssObject.cssObject

  for (const variant of variants) {
    if (
      twCssObject.variants?.includes("responsive") &&
      Object.keys(mediaScreens).includes(variant)
    ) {
      variantTwCssObject = {
        [`@media ${mediaScreens[variant]}`]: variantTwCssObject
      } as AtRule
      continue
    }

    if (twCssObject.variants?.includes(variant)) {
      const pseudoClass = getPseudoClass(variant, classPrefix)
      variantTwCssObject = ({
        [pseudoClass]: variantTwCssObject
      } as unknown) as Rule
      continue
    }

    throw new Error(`Utilitie with class '${variant}' not found`)
  }

  return variantTwCssObject
}

export const transformTwStyleObjectToStyleObject = (
  components: Map<string, TwCssObject>,
  twParsedClasses: Map<string, string[]>,
  mediaScreens: {
    [key: string]: string
  },
  classPrefix: string
) => {
  let cssObject = {}

  twParsedClasses.forEach((variants, twClass) => {
    const twCssObject = components.get(twClass)
    if (twCssObject) {
      if (variants.length === 0) {
        cssObject = merge(cssObject, twCssObject.cssObject)
      } else {
        cssObject = merge(
          cssObject,
          applyVariants(twCssObject, variants, mediaScreens, classPrefix)
        )
      }
    } else {
      throw new Error(`Utilitie with class '${twClass}' not found`)
    }
  })

  return cssObject
}
