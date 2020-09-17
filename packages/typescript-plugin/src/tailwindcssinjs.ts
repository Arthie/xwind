//@ts-expect-error
import corePlugins from "tailwindcss/lib/corePlugins";

import {
  tailwindData,
  TailwindConfig,
  transformPostcssRootsToTwObjectMap,
  getGenerateTwClassSubstituteRoot,
} from "@tailwindcssinjs/tailwindcss-data";

import { Logger } from "typescript-template-language-service-decorator";
import importFresh from "import-fresh";
import { twClassesVariantsParser } from "@tailwindcssinjs/class-composer";
import { Root } from "postcss";

export default function tailwindcssinjs(config: TailwindConfig) {
  const {
    componentsRoot,
    utilitiesRoot,
    screens,
    variants,
    getSubstituteScreenAtRules,
    getSubstituteVariantsAtRules,
  } = tailwindData(config, corePlugins);

  const twObjectMap = transformPostcssRootsToTwObjectMap([
    utilitiesRoot,
    componentsRoot,
  ]);

  const generateTwClassSubstituteRoot = getGenerateTwClassSubstituteRoot(
    screens,
    variants,
    getSubstituteScreenAtRules,
    getSubstituteVariantsAtRules
  );

  const twParser = twClassesVariantsParser(config.separator ?? ":");

  const generateCssFromText = (text: string) => {
    const parsedClasses = twParser(text);

    const roots: Root[] = [];
    for (const parsedClass of parsedClasses) {
      roots.push(generateTwClassSubstituteRoot(twObjectMap, parsedClass));
    }
    return roots;
  };

  return { twObjectMap, screens, variants, generateCssFromText };
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
