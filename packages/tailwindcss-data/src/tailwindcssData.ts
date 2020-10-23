import postcss, { root } from "postcss";

//Tailwindcss imports
import substituteVariantsAtRules from "tailwindcss/lib/lib/substituteVariantsAtRules";
import substituteScreenAtRules from "tailwindcss/lib/lib/substituteScreenAtRules";
import evaluateTailwindFunctions from "tailwindcss/lib/lib/evaluateTailwindFunctions";
import processPlugins from "tailwindcss/lib/util/processPlugins";
import resolveConfig from "tailwindcss/resolveConfig";

import { ResolvedTailwindConfig, TailwindConfig } from "./tailwindcssConfig";
import { getGenerateTwClassSubstituteRoot } from "./utilities";

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

export function tailwindData(
  config: TailwindConfig,
  corePlugins: (config: ResolvedTailwindConfig) => any
) {
  const resolvedConfig = resolveConfig(config) as ResolvedTailwindConfig;

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
  const variants = BASEVARIANTS.concat(
    Object.keys(processedPlugins.variantGenerators)
  );

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
