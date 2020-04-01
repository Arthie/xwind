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
  TwClasses,
} from "@tailwindcssinjs/class-composer";

export const tailwindcssInJs = (config: TailwindConfig) => {
  const {
    resolvedConfig,
    mediaScreens,
    variants,
    applyVariant,
    componentsRoot,
    utilitiesRoot,
  } = tailwindData(config);

  const transformedComponents = transformPostcssRootToTwObjects(componentsRoot, "component");
  const transformedUtilities = transformPostcssRootToTwObjects(utilitiesRoot, "utility");

  const tsStyleObjectMap = transformTwObjectsToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities,
  ]);

  const variantParser = twClassesVariantsParser(resolvedConfig.separator);

  return (...arg: TwClasses[]) => {
    const twParsedClasses = variantParser(arg);

    const cssObject = transformTwStyleObjectToStyleObject(
      tsStyleObjectMap,
      twParsedClasses,
      mediaScreens,
      variants,
      applyVariant,
    );

    return cssObject;
  };
};
