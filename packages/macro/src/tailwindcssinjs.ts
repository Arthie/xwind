import isEqual from "lodash/isEqual";

import { tailwindData } from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssData";

import {
  ObjectStyle,
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

    const twParser = twClassesParser(resolvedConfig.separator);
    const twComposer = twClassesComposer(resolvedConfig.separator);
    tailwind = (twClasses: TwClasses) => {
      const parsedTwClasses = twParser(twClasses);
      const composedTwClasses = twComposer(twClasses);

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
