import postcss, { root } from "postcss";

//Tailwindcss imports
import _resolveConfig from "tailwindcss/resolveConfig";
import corePlugins from "tailwindcss/lib/corePlugins";
import processPlugins from "tailwindcss/lib/util/processPlugins";
import substituteVariantsAtRules from "tailwindcss/lib/lib/substituteVariantsAtRules";
import substituteScreenAtRules from "tailwindcss/lib/lib/substituteScreenAtRules";
import evaluateTailwindFunctions from "tailwindcss/lib/lib/evaluateTailwindFunctions";

import { getGenerateTwClassSubstituteRoot } from "./utilities";

export interface TailwindConfig {
  separator?: string;
  [key: string]: any;
}

export interface ResolvedTailwindConfig extends Required<TailwindConfig> {}

const BASEVARIANTS = [
  "DEFAULT",
  "dark",
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
];

export function resolveConfig(config: TailwindConfig): ResolvedTailwindConfig {
  return _resolveConfig(config);
}

function core(resolvedConfig: ResolvedTailwindConfig) {
  const processedPlugins = processPlugins(
    [...corePlugins(resolvedConfig), ...resolvedConfig.plugins],
    resolvedConfig
  );
  const baseRoot = postcss(evaluateTailwindFunctions(resolvedConfig)).process(
    root({ nodes: processedPlugins.base })
  ).root;
  const utilitiesRoot = root({ nodes: processedPlugins.utilities });
  const componentsRoot = root({ nodes: processedPlugins.components });

  const screens = Object.keys(resolvedConfig.theme.screens);
  const variants = Object.keys(processedPlugins.variantGenerators);
  variants.unshift(...BASEVARIANTS);
  const getSubstituteVariantsAtRules = substituteVariantsAtRules(
    resolvedConfig,
    processedPlugins
  );
  const getSubstituteScreenAtRules = substituteScreenAtRules(resolvedConfig);

  const generateTwClassSubstituteRoot = getGenerateTwClassSubstituteRoot(
    screens,
    resolvedConfig.separator,
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

export default core;
export * from "./utilities";
