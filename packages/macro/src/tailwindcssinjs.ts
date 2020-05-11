import isEqual from "lodash/isEqual";
import resolveConfig from "tailwindcss/resolveConfig";

import { tailwindData } from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssData";
import {
  TailwindConfig,
  ResolvedTialwindConfig,
} from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig";

import {
  twClassesVariantsParser,
  TwClasses,
} from "@tailwindcssinjs/class-composer";
import {
  transformPostcssRootToPostcssRules,
  transformPostcssRulesToTwObjectMap,
  TwObject,
} from "@tailwindcssinjs/transformers";
import { transformTwClassesToStyleObject } from "@tailwindcssinjs/transformers";

let configCache: TailwindConfig;
let tailwind: (arg: TwClasses) => any;
let twObjectMap: Map<string, TwObject>;

export function tailwindcssinjs(config: TailwindConfig, corePlugins: any) {
  if (!configCache || !isEqual(configCache, config)) {
    if (configCache)
      console.log("@tailwindcssinjs/macro - tailwind config changed");
    configCache = config;

    const resolvedConfig = resolveConfig(config) as ResolvedTialwindConfig;
    const variantParser = twClassesVariantsParser(resolvedConfig.separator);
    const {
      mediaScreens,
      variants,
      getSubstituteVariantsAtRules,
      componentsRoot,
      utilitiesRoot,
    } = tailwindData(resolvedConfig, corePlugins(resolvedConfig));

    const componentRules = transformPostcssRootToPostcssRules(componentsRoot);
    const utilityRules = transformPostcssRootToPostcssRules(utilitiesRoot);
    twObjectMap = transformPostcssRulesToTwObjectMap(
      utilityRules,
      componentRules
    );

    tailwind = (arg: TwClasses) => {
      const twParsedClasses = variantParser(arg);

      const styleObject = transformTwClassesToStyleObject(
        twObjectMap,
        twParsedClasses,
        mediaScreens,
        variants,
        getSubstituteVariantsAtRules
      );

      return styleObject;
    };
  }

  return tailwind;
}

export default tailwindcssinjs;
