import { createMacro, MacroError, MacroParams } from "babel-plugin-macros";
import initClassUtilities from "@xwind/class-utilities";
import { getTwConfigCache, getTwConfigPath } from "./tailwindConfig";
import transformClasses from "./classes/transform";
import transformObjectstyles from "./objectstyles/transform";
import initTailwindObjectstyles from "./objectstyles/tailwind";
import initDevTailwindObjectstyles from "./objectstyles/dev/devTailwind";
import devTransformObjectstyles from "./objectstyles/dev/devTransform";
import { resolveXwindConfig } from "./xwindConfig";

interface XwindMacroParams extends MacroParams {
  config?: {
    config?: string;
  };
}

let $twClassesUtils: ReturnType<typeof initClassUtilities>;

let $tailwindObjectStyle: ReturnType<typeof initTailwindObjectstyles>;
let $devTailwindObjectStyle: ReturnType<typeof initDevTailwindObjectstyles>;
let $isDev: boolean;

let $hash: string;

function xwindMacro({
  references: { default: paths },
  state,
  babel: { types: t },
  config,
}: XwindMacroParams) {
  try {
    const twConfigPath = getTwConfigPath(config?.config);
    const { twConfig, hash } = getTwConfigCache(twConfigPath);
    const xwConfig = resolveXwindConfig(twConfigPath, twConfig);

    if (xwConfig.mode === "classes") {
      if (!$twClassesUtils || $hash !== hash) {
        $hash = hash;
        $twClassesUtils = initClassUtilities(twConfig.separator);
      }

      transformClasses(paths, t, $twClassesUtils);
      return;
    }

    if (xwConfig.mode === "objectstyles") {
      const developmentMode = xwConfig.objectstyles?.developmentMode ?? true;
      $isDev = process.env.NODE_ENV === "development" && developmentMode;
      if ($isDev) {
        if (!$devTailwindObjectStyle || $hash !== hash) {
          $hash = hash;
          $devTailwindObjectStyle = initDevTailwindObjectstyles(twConfig);
        }

        devTransformObjectstyles(
          twConfigPath,
          state,
          paths,
          t,
          $devTailwindObjectStyle
        );
      } else {
        if (!$tailwindObjectStyle || $hash !== hash) {
          $hash = hash;
          $tailwindObjectStyle = initTailwindObjectstyles(twConfig);
        }
        transformObjectstyles(paths, t, $tailwindObjectStyle);
      }
      return;
    }

    throw new Error("No mode xwind mode found in tailwind.config.js");
  } catch (err) {
    err.message = `xwind/macro - ${err.message}`;
    throw new MacroError(err);
  }
}

export default createMacro(xwindMacro, {
  configName: "xwind",
});
