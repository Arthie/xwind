import { root } from "postcss";

//Tailwindcss imports
import substituteVariantsAtRules from "tailwindcss/lib/lib/substituteVariantsAtRules";
import substituteScreenAtRules from "tailwindcss/lib/lib/substituteScreenAtRules";
import processPlugins from "tailwindcss/lib/util/processPlugins";
import resolveConfig from "tailwindcss/resolveConfig";

import { ResolvedTailwindConfig, TailwindConfig } from "./tailwindcssConfig";
import { getGenerateTwClassSubstituteRoot } from "./transformers";

function getMediaScreens(config: ResolvedTailwindConfig) {
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
  corePlugins: (config: ResolvedTailwindConfig) => any
) {
  const resolvedConfig = resolveConfig(config) as ResolvedTailwindConfig;

  const processedPlugins = processPlugins(
    [...corePlugins(resolvedConfig), ...resolvedConfig.plugins],
    resolvedConfig
  );

  const baseRoot = root({ nodes: processedPlugins.base });
  const utilitiesRoot = root({ nodes: processedPlugins.utilities });
  const componentsRoot = root({ nodes: processedPlugins.components });

  const screens = getMediaScreens(resolvedConfig);
  const variants = getVariants(processedPlugins.variantGenerators);

  const getSubstituteVariantsAtRules = substituteVariantsAtRules(
    resolvedConfig,
    processedPlugins
  );
  const getSubstituteScreenAtRules = substituteScreenAtRules(resolvedConfig);

  const generateTwClassSubstituteRoot = getGenerateTwClassSubstituteRoot(
    screens,
    getSubstituteScreenAtRules,
    getSubstituteVariantsAtRules
  );

  return {
    baseRoot,
    utilitiesRoot,
    componentsRoot,
    processedPlugins,
    resolvedConfig,
    screens,
    variants,
    getSubstituteScreenAtRules,
    getSubstituteVariantsAtRules,
    generateTwClassSubstituteRoot,
  };
}
