import {
  tailwindData,
  resolveTailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data";

import {
  transformPostcssRootToTwObjects,
  transformTwObjectsToTwStyleObjectMap,
} from "@tailwindcssinjs/transformers";

export const tailwindcssInJs = () => {
  const config = resolveTailwindConfig();

  const { componentsRoot, utilitiesRoot } = tailwindData(config);

  const transformedComponents = transformPostcssRootToTwObjects(componentsRoot);
  const transformedUtilities = transformPostcssRootToTwObjects(utilitiesRoot);

  const mappedTwCssObjects = transformTwObjectsToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities,
  ]);

  return mappedTwCssObjects;
};
