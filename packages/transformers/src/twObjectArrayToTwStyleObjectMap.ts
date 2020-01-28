import merge from "lodash/merge"
import { TwObject, TwCssObject, Rule, AtRule } from "./transformTypes"

export const parseSelector = (selector: string) => {
  const pseudoSelector = selector.match(/[:]{1,2}\S*$/)?.[0]
  const classNameSelector = pseudoSelector
    ? selector.replace(pseudoSelector, "")
    : selector
  const className = classNameSelector.substring(1)
  return {
    selector,
    pseudoSelector,
    className
  }
}

const transformTwObjectToTwCssObject = (twObject: TwObject) => {
  const { selector, decls, atRule, variants } = twObject

  const TwCssObject: TwCssObject = {
    cssObject: decls
  }

  const pseudoClass = parseSelector(selector).pseudoSelector
  if (pseudoClass) {
    const cssObject = TwCssObject.cssObject as Rule
    TwCssObject.cssObject = { [`&${pseudoClass}`]: cssObject }
  }

  if (atRule) {
    const cssObject = TwCssObject.cssObject as AtRule
    TwCssObject.cssObject = { [atRule]: cssObject }
  }

  if (variants) {
    TwCssObject.variants = variants
  }

  return TwCssObject
}

export const transformTwObjectArrayToTwStyleObjectMap = (
  twObjects: TwObject[]
) => {
  const mappedObject = new Map<string, TwCssObject>()
  for (const twObject of twObjects) {
    const { className } = parseSelector(twObject.selector)
    const cssObject = transformTwObjectToTwCssObject(twObject)
    if (mappedObject.has(className)) {
      mappedObject.set(className, merge(mappedObject.get(className), cssObject))
    } else {
      mappedObject.set(className, cssObject)
    }
  }
  return mappedObject
}
