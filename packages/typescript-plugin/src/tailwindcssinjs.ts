//@ts-expect-error
import corePlugins from "tailwindcss/lib/corePlugins";

import {
  tailwindData,
  TailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data";

import {
  transformPostcssRootToPostcssRules,
  transformPostcssRulesToTwObjectMap,
  getGenerateTwClassSubstituteRoot,
} from "@tailwindcssinjs/transformers";

import { Logger } from "typescript-template-language-service-decorator";
import importFresh from "import-fresh";

export default function tailwindcssinjs(config: TailwindConfig) {
  const {
    componentsRoot,
    utilitiesRoot,
    screens,
    variants,
    getSubstituteScreenAtRules,
    getSubstituteVariantsAtRules,
  } = tailwindData(config, corePlugins);

  const componentRules = transformPostcssRootToPostcssRules(componentsRoot);
  const utilityRules = transformPostcssRootToPostcssRules(utilitiesRoot);
  const twObjectMap = transformPostcssRulesToTwObjectMap(
    utilityRules,
    componentRules
  );

  const generateTwClassSubstituteRoot = getGenerateTwClassSubstituteRoot(
    screens,
    variants,
    getSubstituteScreenAtRules,
    getSubstituteVariantsAtRules
  );

  return { twObjectMap, screens, variants, generateTwClassSubstituteRoot };
}

export function requireTailwindConfig(
  logger: Logger,
  configPath?: string
): TailwindConfig {
  try {
    const config = configPath
      ? importFresh(configPath)
      : require("tailwindcss/defaultConfig");
    return config;
  } catch (err) {
    logger.log(`Tailwind config file not found '${configPath}' | ${err}`);
    return require("tailwindcss/defaultConfig");
  }
}
