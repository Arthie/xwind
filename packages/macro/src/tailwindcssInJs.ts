import {
  tailwindData,
  TailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data";

import {
  transformPostcssRootToTwObjects,
  transformTwObjectsToTwStyleObjectMap,
  transformTwStyleObjectToStyleObject,
} from "@tailwindcssinjs/transformers";

import {
  twClassesVariantsParser,
} from "@tailwindcssinjs/class-composer";

export const tailwindcssInJs = (config: TailwindConfig, strict: boolean) => {
  const {
    resolvedConfig,
    mediaScreens,
    componentsRoot,
    utilitiesRoot,
  } = tailwindData(config);

  const transformedComponents = transformPostcssRootToTwObjects(componentsRoot);
  const transformedUtilities = transformPostcssRootToTwObjects(utilitiesRoot);

  const mappedTwCssObjects = transformTwObjectsToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities,
  ]);

  return (...arg: string[]) => {
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
