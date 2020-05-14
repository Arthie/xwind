import isEqual from "lodash/isEqual";

import {
  tailwindData,
  ResolvedTialwindConfig,
  TailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data";
import {
  twClassesVariantsParser,
  TwClasses,
} from "@tailwindcssinjs/class-composer";
import {
  transformPostcssRootToPostcssRules,
  transformPostcssRulesToTwObjectMap,
  transformTwClassesToStyleObject,
  TwObject,
  StyleObject,
  getGenerateTwClassSubstituteRoot,
} from "@tailwindcssinjs/transformers";

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

    const componentRules = transformPostcssRootToPostcssRules(componentsRoot);
    const utilityRules = transformPostcssRootToPostcssRules(utilitiesRoot);
    twObjectMap = transformPostcssRulesToTwObjectMap(
      utilityRules,
      componentRules
    );

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
