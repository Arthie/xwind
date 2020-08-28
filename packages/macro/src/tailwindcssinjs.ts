import isEqual from "lodash/isEqual";

import { tailwindData } from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssData";

import {
  transformPostcssRootsToTwObjectMap,
  transformTwClassesToStyleObject,
  TwObject,
  StyleObject,
  getGenerateTwClassSubstituteRoot,
} from "@tailwindcssinjs/tailwindcss-data/lib/transformers";

import {
  ResolvedTialwindConfig,
  TailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig";

import {
  twClassesVariantsParser,
  TwClasses,
} from "@tailwindcssinjs/class-composer";

type TailwindcssinjsConfigPlugin = (styleObject: StyleObject) => StyleObject;

interface TailwindcssinjsConfig extends TailwindConfig {
  tailwindcssinjs?: {
    plugins?: TailwindcssinjsConfigPlugin[];
  };
}

let configCache: TailwindcssinjsConfig;
let tailwind: (arg: TwClasses) => any;
let twObjectMap: Map<string, TwObject>;

export default function tailwindcssinjs(
  config: TailwindcssinjsConfig,
  corePlugins: (arg: ResolvedTialwindConfig) => any
) {
  if (!configCache || !isEqual(configCache, config)) {
    if (configCache)
      console.log("@tailwindcssinjs/macro - tailwind config changed");
    configCache = config;

    const {
      resolvedConfig,
      screens,
      variants,
      getSubstituteVariantsAtRules,
      getSubstituteScreenAtRules,
      componentsRoot,
      utilitiesRoot,
    } = tailwindData(config, corePlugins);

    const variantParser = twClassesVariantsParser(resolvedConfig.separator);

    twObjectMap = transformPostcssRootsToTwObjectMap([
      utilitiesRoot,
      componentsRoot,
    ]);

    const generateTwClassSubstituteRoot = getGenerateTwClassSubstituteRoot(
      screens,
      variants,
      getSubstituteScreenAtRules,
      getSubstituteVariantsAtRules
    );

    tailwind = (twClasses: TwClasses) => {
      const twParsedClasses = variantParser(twClasses);

      let styleObject = transformTwClassesToStyleObject(
        twObjectMap,
        twParsedClasses,
        generateTwClassSubstituteRoot
      );

      if (config.tailwindcssinjs?.plugins) {
        for (const plugin of config.tailwindcssinjs.plugins) {
          styleObject = plugin(styleObject);
        }
      }

      return styleObject;
    };
  }

  return tailwind;
}
