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
  parsedTwClasses: [string, string[]][],
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

export default function tailwindcssinjs(
  config: TailwindcssinjsConfig,
  corePlugins: (arg: ResolvedTailwindConfig) => any
) {
  if (!configCache || !isEqual(configCache, config)) {
    if (configCache)
      console.log("@tailwindcssinjs/macro - tailwind config changed");
    configCache = config;

    const {
      resolvedConfig,
      generateTwClassSubstituteRoot,
      utilitiesRoot,
      componentsRoot,
    } = tailwindData(config, corePlugins);

    const twClassDictionary = createTwClassDictionary(
      utilitiesRoot,
      componentsRoot
    );

    _twClassDictionary = twClassDictionary;

    const twParser = twClassesParser(resolvedConfig.separator);
    const twComposer = twClassesComposer(resolvedConfig.separator);
    tailwind = (twClasses: TwClasses) => {
      const parsedTwClasses = twParser(twClasses);
      for (const twClass of twComposer(twClasses)) {
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
          objectStyle = plugin(objectStyle, parsedTwClasses, resolvedConfig);
        }
      }

      return objectStyle;
    };
  }

  return tailwind;
}
