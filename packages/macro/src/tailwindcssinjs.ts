import isEqual from "lodash/isEqual";

import { tailwindData } from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssData";
import {
  TailwindConfig,
  ResolvedTialwindConfig,
} from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig";

import {
  transformPostcssRootToTwObjects,
  transformTwObjectsToTwStyleObjectMap,
  transformTwStyleObjectToStyleObject,
} from "@tailwindcssinjs/transformers";

import {
  twClassesVariantsParser,
  TwClasses,
} from "@tailwindcssinjs/class-composer";

import resolveConfig from "tailwindcss/resolveConfig";

let tailwindconfig: TailwindConfig;
let tailwind: (arg: TwClasses) => any;

export function tailwindcssinjs(config: TailwindConfig, corePlugins: any) {
  if (!tailwindconfig || !isEqual(tailwindconfig, config)) {
    if (tailwindconfig)
      console.log("@tailwindcssinjs/macro - tailwind config changed");
    tailwindconfig = config;

    const resolvedConfig = resolveConfig(config) as ResolvedTialwindConfig;

    const {
      mediaScreens,
      variants,
      applyVariant,
      componentsRoot,
      utilitiesRoot,
    } = tailwindData(resolvedConfig, corePlugins(resolvedConfig));

    const transformedComponents = transformPostcssRootToTwObjects(
      componentsRoot,
      "component"
    );
    const transformedUtilities = transformPostcssRootToTwObjects(
      utilitiesRoot,
      "utility"
    );

    const twStyleObjectMap = transformTwObjectsToTwStyleObjectMap([
      ...transformedComponents,
      ...transformedUtilities,
    ]);

    const variantParser = twClassesVariantsParser(resolvedConfig.separator);

    tailwind = (arg: TwClasses) => {
      const twParsedClasses = variantParser(arg);

      const cssObject = transformTwStyleObjectToStyleObject(
        twStyleObjectMap,
        twParsedClasses,
        mediaScreens,
        variants,
        applyVariant
      );

      return cssObject;
    };
  }

  return tailwind;
}

export default tailwindcssinjs;
