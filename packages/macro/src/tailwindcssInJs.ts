import { tailwindData } from "@tailwindcssinjs/tailwindcss-data"

import {
  transformPostcssRootToTwObject,
  transformTwObjectArrayToTwStyleObjectMap,
  transformTwStyleObjectToStyleObject
} from "@tailwindcssinjs/transformers"

import {
  twClassNameMapParser,
  TwClassName
} from "@tailwindcssinjs/classname-composer"
import { TailwindConfig } from "./tailwindcssConfig"

export const tailwindcssInJs = (config: TailwindConfig) => {
  const {
    resolvedConfig,
    mediaScreens,
    componentsRoot,
    utilitiesRoot
  } = tailwindData(config)

  const transformedComponents = transformPostcssRootToTwObject(componentsRoot)
  const transformedUtilities = transformPostcssRootToTwObject(utilitiesRoot)

  const mappedTwCssObjects = transformTwObjectArrayToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities
  ])

  return (...arg: TwClassName[]) => {
    const twParsedClassNames = twClassNameMapParser(
      arg,
      resolvedConfig.separator
    )

    const cssObject = transformTwStyleObjectToStyleObject(
      mappedTwCssObjects,
      twParsedClassNames,
      mediaScreens,
      resolvedConfig.prefix
    )

    return cssObject
  }
}
