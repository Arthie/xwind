// @future https://github.com/babel/babel/pull/11741 + maybe depend on generated css???
import Babel, { PluginObj, PluginPass } from "@babel/core";
import { getTwConfigPath } from "./tailwindConfig";
import { getCachedTransformer } from "./transformUtils";

const MODULES = ["xwind", "xwind/macro"];

function babel(
  babel: typeof Babel,
  config: { config?: string },
  workingPath: string
): PluginObj<PluginPass> {
  const { types: t } = babel;
  const twConfigPath = getTwConfigPath(config.config);
  return {
    name: "xwind",
    visitor: {
      ImportDefaultSpecifier(path, state) {
        //get referencePaths for default import from "xwind" or "xwind/macro"
        if (!path.parentPath.isImportDeclaration()) return;
        if (path.parent.type !== "ImportDeclaration") return;
        if (!MODULES.includes(path.parent.source.value)) return;

        const referencePaths =
          path.scope.bindings[path.node.local.name].referencePaths;

        //remove default import and remove import if no other specifiers exist
        path.remove();
        if (path.parent.specifiers.length === 0) {
          path.parentPath.remove();
        }

        if (!referencePaths.length) return;

        const transformer = getCachedTransformer(twConfigPath);
        transformer(referencePaths, state, t);
      },
    },
  };
}

export default babel;
