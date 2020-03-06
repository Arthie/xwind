import merge from "lodash/merge"
import { TwObject, TwCssObject, Rule, AtRule } from "./transformersTypes"

const SELECTOR_REGXEXP = /[:]{1,2}\S*$/

export const parseSelector = (selector: string) => {
  const [pseudoSelector] = selector.match(SELECTOR_REGXEXP) || [null]
  const twClassSelector = pseudoSelector
    ? selector.replace(pseudoSelector, "")
    : selector
  const twClass = twClassSelector.substring(1)
  return {
    selector,
    pseudoSelector,
    twClass
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
    const { twClass } = parseSelector(twObject.selector)
    const cssObject = transformTwObjectToTwCssObject(twObject)
    if (mappedObject.has(twClass)) {
      mappedObject.set(twClass, merge(mappedObject.get(twClass), cssObject))
    } else {
      mappedObject.set(twClass, cssObject)
    }
  }
  return mappedObject
}
