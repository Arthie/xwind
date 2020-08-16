import postcss from "postcss";

//Tailwindcss imports
import substituteVariantsAtRules from "tailwindcss/lib/lib/substituteVariantsAtRules";
import substituteScreenAtRules from "tailwindcss/lib/lib/substituteScreenAtRules";
import processPlugins from "tailwindcss/lib/util/processPlugins";
import resolveConfig from "tailwindcss/resolveConfig";

import { ResolvedTialwindConfig, TailwindConfig } from "./tailwindcssConfig";

export { ResolvedTialwindConfig, TailwindConfig } from "./tailwindcssConfig";

function getMediaScreens(config: ResolvedTialwindConfig) {
  return Object.keys(config.theme.screens);
}

function getVariants(variantGenerators: any) {
  return [
    "default",
    "motion-safe",
    "motion-reduce",
    "group-hover",
    "group-focus",
    "hover",
    "focus-within",
    "focus-visible",
    "focus",
    "active",
    "visited",
    "disabled",
    "checked",
    "first",
    "last",
    "odd",
    "even",
  ].concat(Object.keys(variantGenerators));
}

export function tailwindData(
  config: TailwindConfig,
  corePlugins: (config: ResolvedTialwindConfig) => any
) {
  const resolvedConfig = resolveConfig(config) as ResolvedTialwindConfig;

  const processedPlugins = processPlugins(
    [...corePlugins(resolvedConfig), ...resolvedConfig.plugins],
    resolvedConfig
  );

  const baseRoot = postcss.root({ nodes: processedPlugins.base });
  const utilitiesRoot = postcss.root({ nodes: processedPlugins.utilities });
  const componentsRoot = postcss.root({ nodes: processedPlugins.components });

  const screens = getMediaScreens(resolvedConfig);
  const variants = getVariants(processedPlugins.variantGenerators);

  const getSubstituteVariantsAtRules = substituteVariantsAtRules(
    resolvedConfig,
    processedPlugins
  );
  const getSubstituteScreenAtRules = substituteScreenAtRules(resolvedConfig);

  return {
    resolvedConfig,
    componentsRoot,
    utilitiesRoot,
    baseRoot,
    screens,
    variants,
    getSubstituteVariantsAtRules,
    getSubstituteScreenAtRules,
  };
}
