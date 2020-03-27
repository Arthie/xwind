import {
  tailwindData,
  TailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data";

import {
  transformPostcssRootToTwObject,
  transformTwObjectArrayToTwStyleObjectMap,
  transformTwStyleObjectToStyleObject,
} from "@tailwindcssinjs/transformers";

import {
  twClassesVariantsParser,
  TwClass,
} from "@tailwindcssinjs/class-composer";

export const tailwindcssInJs = (config: TailwindConfig, strict: boolean) => {
  const {
    resolvedConfig,
    mediaScreens,
    componentsRoot,
    utilitiesRoot,
  } = tailwindData(config);

  const transformedComponents = transformPostcssRootToTwObject(componentsRoot);
  const transformedUtilities = transformPostcssRootToTwObject(utilitiesRoot);

  const mappedTwCssObjects = transformTwObjectArrayToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities,
  ]);

  return (...arg: TwClass[]) => {
    const twParsedClassNames = twClassesVariantsParser(
      resolvedConfig.separator
    )(...arg);

    const cssObject = transformTwStyleObjectToStyleObject(
      mappedTwCssObjects,
      twParsedClassNames,
      mediaScreens,
      resolvedConfig.prefix,
      strict
    );

    return cssObject;
  };
};
