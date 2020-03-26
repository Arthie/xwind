import {
  tailwindData,
  resolveTailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data";

import {
  transformPostcssRootToTwObject,
  transformTwObjectArrayToTwStyleObjectMap,
} from "@tailwindcssinjs/transformers";

export const tailwindcssInJs = () => {
  const config = resolveTailwindConfig();

  const { componentsRoot, utilitiesRoot } = tailwindData(config);

  const transformedComponents = transformPostcssRootToTwObject(componentsRoot);
  const transformedUtilities = transformPostcssRootToTwObject(utilitiesRoot);

  const mappedTwCssObjects = transformTwObjectArrayToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities,
  ]);

  return mappedTwCssObjects;
};
