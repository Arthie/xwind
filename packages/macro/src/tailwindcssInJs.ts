import { tailwindData } from "@tailwindcssinjs/tailwindcss-data"

import {
  transformPostcssRootToTwObject,
  transformTwObjectArrayToTwStyleObjectMap,
  transformTwStyleObjectToStyleObject
} from "@tailwindcssinjs/transformers"

import { twClassesMapParser, TwClass } from "@tailwindcssinjs/class-composer"
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

  return (...arg: TwClass[]) => {
    const twParsedClassNames = twClassesMapParser(arg, resolvedConfig.separator)

    const cssObject = transformTwStyleObjectToStyleObject(
      mappedTwCssObjects,
      twParsedClassNames,
      mediaScreens,
      resolvedConfig.prefix
    )

    return cssObject
  }
}
