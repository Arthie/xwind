import isEqual from "lodash/isEqual";
import resolveConfig from "tailwindcss/resolveConfig";

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
} from "@tailwindcssinjs/transformers";

import { removeStyleObjectfallbacks } from "./utils";

let configCache: TailwindConfig;
let tailwind: (arg: TwClasses) => any;
let twObjectMap: Map<string, TwObject>;

interface TailwindcssinjsOptions {
  fallbacks?: boolean;
}

export function tailwindcssinjs(
  config: TailwindConfig,
  corePlugins: (arg: ResolvedTialwindConfig) => any,
  options?: TailwindcssinjsOptions
) {
  if (!configCache || !isEqual(configCache, config)) {
    if (configCache)
      console.log("@tailwindcssinjs/macro - tailwind config changed");
    configCache = config;

    const resolvedConfig = resolveConfig(config) as ResolvedTialwindConfig;
    const variantParser = twClassesVariantsParser(resolvedConfig.separator);
    const {
      screens,
      variants,
      getSubstituteVariantsAtRules,
      getSubstituteScreenAtRules,
      componentsRoot,
      utilitiesRoot,
    } = tailwindData(resolvedConfig, corePlugins(resolvedConfig));

    const componentRules = transformPostcssRootToPostcssRules(componentsRoot);
    const utilityRules = transformPostcssRootToPostcssRules(utilitiesRoot);
    twObjectMap = transformPostcssRulesToTwObjectMap(
      utilityRules,
      componentRules
    );

    tailwind = (twClasses: TwClasses) => {
      const twParsedClasses = variantParser(twClasses);

      const styleObject = transformTwClassesToStyleObject(
        twObjectMap,
        twParsedClasses,
        screens,
        variants,
        getSubstituteScreenAtRules,
        getSubstituteVariantsAtRules
      );

      if (!options?.fallbacks) {
        return removeStyleObjectfallbacks(styleObject);
      }

      return styleObject;
    };
  }

  return tailwind;
}

export default tailwindcssinjs;
