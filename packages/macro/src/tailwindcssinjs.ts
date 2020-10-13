import isEqual from "lodash/isEqual";

import { tailwindData } from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssData";

import {
  transformTwClassesToObjectStyle,
  ObjectStyle,
  TwObject,
} from "@tailwindcssinjs/tailwindcss-data/lib/transformers";

import {
  ResolvedTialwindConfig,
  resolveTailwindConfigPath,
  TailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig";

import {
  twClassesVariantsParser,
  TwClasses,
  twClassesComposer,
} from "@tailwindcssinjs/class-composer";

type TailwindcssinjsConfigPlugin = (
  objectStyle: ObjectStyle,
  parsedTwClasses: [string, string[]][],
  resolvedConfig: ResolvedTialwindConfig
) => ObjectStyle;

interface TailwindcssinjsConfig extends TailwindConfig {
  tailwindcssinjs?: {
    plugins?: TailwindcssinjsConfigPlugin[];
  };
}

let configCache: TailwindcssinjsConfig;
let tailwind: (arg: TwClasses) => any;

export let _twObjectMap: Map<string, TwObject>;
export const _twClasses: Set<string> = new Set();

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
      generateTwClassSubstituteRoot,
      twObjectMap,
    } = tailwindData(config, corePlugins);

    _twObjectMap = twObjectMap;

    const variantParser = twClassesVariantsParser(resolvedConfig.separator);
    const composer = twClassesComposer(resolvedConfig.separator);
    tailwind = (twClasses: TwClasses) => {
      const parsedTwClasses = variantParser(twClasses);
      for (const twClass of composer(twClasses)) {
        _twClasses.add(twClass);
      }
      let objectStyle = transformTwClassesToObjectStyle(
        twObjectMap,
        parsedTwClasses,
        generateTwClassSubstituteRoot
      );

      if (config.tailwindcssinjs?.plugins) {
        for (const plugin of config.tailwindcssinjs.plugins) {
          objectStyle = plugin(objectStyle, parsedTwClasses, resolvedConfig);
        }
      }

      return objectStyle;
    };
  }

  return tailwind;
}
