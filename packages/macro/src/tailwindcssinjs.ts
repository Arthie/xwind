import isEqual from "lodash/isEqual";

import { tailwindData } from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssData";

import {
  ObjectStyle,
  TwClassDictionary,
  createTwClassDictionary,
  mergeObjectStyles,
  transformTwRootToObjectStyle,
} from "../../tailwindcss-data/lib/utilities";

import {
  ResolvedTailwindConfig,
  TailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig";

import {
  twClassesParser,
  TwClasses,
  twClassesComposer,
} from "@tailwindcssinjs/class-composer";

type TailwindcssinjsConfigPlugin = (
  objectStyle: ObjectStyle,
  parsedTwClasses: string[],
  resolvedConfig: TailwindConfig
) => ObjectStyle;

interface TailwindcssinjsConfig extends TailwindConfig {
  tailwindcssinjs?: {
    plugins?: TailwindcssinjsConfigPlugin[];
  };
}

let configCache: TailwindcssinjsConfig;
let tailwind: (arg: TwClasses) => any;

export let _twClassDictionary: TwClassDictionary;
export const _twClasses: Set<string> = new Set();
export let _tailwindData: {
  baseRoot: import("postcss").Root;
  utilitiesRoot: import("postcss").Root;
  componentsRoot: import("postcss").Root;
  processedPlugins: any;
  resolvedConfig: ResolvedTailwindConfig;
  screens: string[];
  variants: string[];
  getSubstituteScreenAtRules: any;
  getSubstituteVariantsAtRules: any;
  generateTwClassSubstituteRoot: any;
}

export default function tailwindcssinjs(
  config: TailwindcssinjsConfig,
  corePlugins: (arg: ResolvedTailwindConfig) => any
) {
  if (!configCache || !isEqual(configCache, config)) {
    if (configCache)
      console.log("@tailwindcssinjs/macro - tailwind config changed");
    configCache = config;

    _tailwindData = tailwindData(config, corePlugins);
    const {
      resolvedConfig,
      generateTwClassSubstituteRoot,
      utilitiesRoot,
      componentsRoot,
    } = _tailwindData

    const twClassDictionary = createTwClassDictionary(
      utilitiesRoot,
      componentsRoot
    );

    _twClassDictionary = twClassDictionary;

    const twParser = twClassesParser(resolvedConfig.separator);
    const twComposer = twClassesComposer(resolvedConfig.separator);
    tailwind = (twClasses: TwClasses) => {
      const parsedTwClasses = twParser(twClasses);
      const composedTwClasses = twComposer(twClasses)
      for (const twClass of composedTwClasses) {
        _twClasses.add(twClass);
      }

      const objectStyles: ObjectStyle[] = [];
      for (const parsedTwClass of parsedTwClasses) {
        const twRoot = generateTwClassSubstituteRoot(
          twClassDictionary,
          parsedTwClass
        );
        objectStyles.push(
          transformTwRootToObjectStyle(parsedTwClass[0], twRoot)
        );
      }

      let objectStyle = mergeObjectStyles(objectStyles);

      if (config.tailwindcssinjs?.plugins) {
        for (const plugin of config.tailwindcssinjs.plugins) {
          objectStyle = plugin(objectStyle, composedTwClasses, resolvedConfig);
        }
      }

      return objectStyle;
    };
  }

  return tailwind;
}
