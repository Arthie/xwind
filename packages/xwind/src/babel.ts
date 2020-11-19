// @future https://github.com/babel/babel/pull/11741 + maybe depend on generated css???
// merge screen atrules?
import Babel, { PluginObj, PluginPass } from "@babel/core";
import initClassUtilities from "@xwind/class-utilities";
import initTailwindObjectstyles from "./objectstyles/tailwind";
import { getTwConfigPath, getTwConfigCache } from "./tailwindConfig";
import transformClasses from "./classes/transform";
import transformObjectstyles from "./objectstyles/transform";
import initDevTailwindObjectstyles from "./objectstyles/dev/devTailwind";
import devTransformObjectstyles from "./objectstyles/dev/devTransform";
import { resolveXwindConfig } from "./xwindConfig";

function getReferencePaths(
  path: Babel.NodePath<Babel.types.ImportDefaultSpecifier>
) {
  //get referencePaths for default import from "xwind" or "xwind/macro"
  if (!path.parentPath.isImportDeclaration()) return;
  if (path.parent.type !== "ImportDeclaration") return;
  if (!["xwind", "xwind/macro"].includes(path.parent.source.value)) return;

  const referencePaths =
    path.scope.bindings[path.node.local.name].referencePaths;

  //remove default import and remove import if no other specifiers exist
  path.remove();
  if (path.parent.specifiers.length === 0) {
    path.parentPath.remove();
  }

  if (!referencePaths.length) return;
  return referencePaths;
}

let $twClassesUtils: ReturnType<typeof initClassUtilities>;

let $tailwindObjectStyle: ReturnType<typeof initTailwindObjectstyles>;
let $devTailwindObjectStyle: ReturnType<typeof initDevTailwindObjectstyles>;
let $isDev: boolean;

function babel(
  babel: typeof Babel,
  config: { config?: string },
  workingPath: string
): PluginObj<PluginPass> {
  const { types: t } = babel;

  const twConfigPath = getTwConfigPath(config.config);
  const { twConfig } = getTwConfigCache(twConfigPath);
  const xwConfig = resolveXwindConfig(twConfigPath, twConfig);

  if (xwConfig.mode === "classes") {
    return {
      name: "xwind",
      pre(state) {
        const { twConfig, isOldTwConfig } = getTwConfigCache(twConfigPath);
        if ($twClassesUtils && isOldTwConfig) return;
        const xwConfig = resolveXwindConfig(twConfigPath, twConfig);
        $twClassesUtils = initClassUtilities(twConfig.separator);
      },
      visitor: {
        ImportDefaultSpecifier(path, state) {
          const referencePaths = getReferencePaths(path);
          if (!referencePaths) return;
          const twClasses = transformClasses(
            referencePaths,
            t,
            $twClassesUtils
          );
          //@ts-expect-error
          state.file.metadata.xwind = twClasses;
          return;
        },
      },
    };
  }

  if (xwConfig.mode === "objectstyles") {
    return {
      name: "xwind",
      pre(state) {
        const { twConfig, isOldTwConfig } = getTwConfigCache(twConfigPath);
        if (($devTailwindObjectStyle || $tailwindObjectStyle) && isOldTwConfig)
          return;
        const xwConfig = resolveXwindConfig(twConfigPath, twConfig);
        if (xwConfig.mode !== "objectstyles")
          throw new Error(
            `XWIND: Mode has been set to "${xwConfig.mode}". Please change the mode option from the xwind config object in the "${twConfigPath}" file to "objectstyles"`
          );
        const developmentMode = xwConfig.objectstyles?.developmentMode ?? true;
        $isDev = process.env.NODE_ENV === "development" && developmentMode;
        if ($isDev) {
          $devTailwindObjectStyle = initDevTailwindObjectstyles(twConfig);
        } else {
          $tailwindObjectStyle = initTailwindObjectstyles(twConfig);
        }
      },
      visitor: {
        ImportDefaultSpecifier(path, state) {
          const referencePaths = getReferencePaths(path);
          if (!referencePaths) return;
          if ($isDev) {
            devTransformObjectstyles(
              twConfigPath,
              state,
              referencePaths,
              t,
              $devTailwindObjectStyle
            );
          } else {
            transformObjectstyles(referencePaths, t, $tailwindObjectStyle);
          }
        },
      },
    };
  }

  throw new Error("Whoops! This error should not be possible!");
}

export default babel;
