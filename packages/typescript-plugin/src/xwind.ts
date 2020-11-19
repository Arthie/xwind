import {
  tailwindData,
  resolveConfig,
  TailwindConfig,
  createTwClassDictionary,
} from "@xwind/core";

import { Logger } from "typescript-template-language-service-decorator";
import importFresh from "import-fresh";
import { twClassesParser } from "@xwind/class-utilities";
import { Root } from "postcss";

export default function xwind(config: TailwindConfig) {
  const resolvedConfig = resolveConfig(config);
  const {
    screens,
    variants,
    generateTwClassSubstituteRoot,
    utilitiesRoot,
    componentsRoot,
  } = tailwindData(resolvedConfig);

  const twObjectMap = createTwClassDictionary(utilitiesRoot, componentsRoot);

  const generateCssFromText = (text: string) => {
    const parsedClasses = twClassesParser(resolvedConfig.separator, text);

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
