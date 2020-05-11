import postcss from "postcss";
import "core-js/stable/object/from-entries";

//Tailwindcss imports
import buildMediaQuery from "tailwindcss/lib/util/buildMediaQuery";
import substituteVariantsAtRules from "tailwindcss/lib/lib/substituteVariantsAtRules";
import processPlugins from "tailwindcss/lib/util/processPlugins";

import { ResolvedTialwindConfig } from "./tailwindcssConfig";

export function getMediaScreens(config: ResolvedTialwindConfig) {
  const screens = Object.entries(config.theme.screens);
  const buildScreens = screens.map(([key, value]): [string, string] => [
    key,
    buildMediaQuery(value),
  ]);
  return Object.fromEntries(buildScreens);
}

export function getVariants(variantGenerators: any) {
  return [
    "default",
    "group-hover",
    "group-focus",
    "hover",
    "focus-within",
    "focus",
    "active",
    "visited",
    "disabled",
    "first",
    "last",
    "odd",
    "even",
  ].concat(Object.keys(variantGenerators));
}

export function processTailwindPlugins(
  config: ResolvedTialwindConfig,
  corePlugins: any
) {
  const processedPlugins = processPlugins(
    [...corePlugins, ...config.plugins],
    config
  );

  return {
    variantGenerators: processedPlugins.variantGenerators,
    baseRoot:
      processedPlugins.base ?? postcss.root({ nodes: processedPlugins.base }),
    utilitiesRoot: postcss.root({ nodes: processedPlugins.utilities }),
    componentsRoot: postcss.root({ nodes: processedPlugins.components }),
  };
}

export function tailwindData(
  resolvedConfig: ResolvedTialwindConfig,
  corePlugins: any
) {
  const {
    utilitiesRoot,
    componentsRoot,
    baseRoot,
    variantGenerators,
  } = processTailwindPlugins(resolvedConfig, corePlugins);

  const mediaScreens = getMediaScreens(resolvedConfig);
  const variants = getVariants(variantGenerators);
  const getSubstituteVariantsAtRules = substituteVariantsAtRules(
    resolvedConfig,
    {
      variantGenerators,
    }
  );

  return {
    resolvedConfig,
    componentsRoot,
    utilitiesRoot,
    baseRoot,
    mediaScreens,
    variants,
    getSubstituteVariantsAtRules,
    variantGenerators,
  };
}
