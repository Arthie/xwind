import fs from "fs";

import {
  tailwindData,
  resolveTailwindConfig,
  resolveTailwindConfigPath,
} from "@tailwindcssinjs/tailwindcss-data";

import {
  transformPostcssRootToTwObjects,
  transformTwObjectsToTwStyleObjectMap,
  transformTwStyleObjectToStyleObject,
} from "@tailwindcssinjs/transformers";

import {
  twClassesVariantsParser,
  TwClasses,
} from "@tailwindcssinjs/class-composer";

let configCache = Buffer.from("");
let tailwind: (args: TwClasses[]) => any;
let configPath: string | undefined;

export const tailwindcssInJs = () => {
  //check for config
  try {
    configPath = resolveTailwindConfigPath();
  } catch (err) {
    configPath = undefined;
  }

  //check if config has changed
  let configHasChanged;
  if (configPath) {
    const configfile = fs.readFileSync(configPath);
    configHasChanged = !configCache.equals(configfile);
    if (configHasChanged) {
      if (configCache.length > 0)
        console.log(
          "@tailwindcssinjs/macro - Tailwind config has been changed"
        );
      configCache = configfile;
    }
  }

  if (configHasChanged || !tailwind) {
    const config = resolveTailwindConfig(configPath);

    const {
      resolvedConfig,
      mediaScreens,
      variants,
      applyVariant,
      componentsRoot,
      utilitiesRoot,
    } = tailwindData(config);

    const transformedComponents = transformPostcssRootToTwObjects(
      componentsRoot,
      "component"
    );
    const transformedUtilities = transformPostcssRootToTwObjects(
      utilitiesRoot,
      "utility"
    );

    const tsStyleObjectMap = transformTwObjectsToTwStyleObjectMap([
      ...transformedComponents,
      ...transformedUtilities,
    ]);

    const variantParser = twClassesVariantsParser(resolvedConfig.separator);

    tailwind = (arg: TwClasses[]) => {
      const twParsedClasses = variantParser(arg);

      const cssObject = transformTwStyleObjectToStyleObject(
        tsStyleObjectMap,
        twParsedClasses,
        mediaScreens,
        variants,
        applyVariant
      );

      return cssObject;
    };
  }

  return tailwind;
};
