import Babel from "@babel/core";
import initDevTailwindObjectstyles from "./devTailwind";
import { getArgs } from "../../transformUtils";
import importFresh from "import-fresh";
import { ObjectStyle } from "@xwind/core";
import generateDevCorePlugins from "./devObjectstylesGenerator";

/**
 * Add development imports to the file this enables hot reloading on config changes
 *
 * Example imports:
 * import tailwindconfig from "ABSULUTEPATH/tailwind.config";
 * import devCorePluginsCreator from "@xwind/macro/lib/devCorePluginsCreator"
 * import xwind from "@xwind/macro/lib/xwind";
 * const tw = xwind(tailwindconfig, devCorePluginsCreator);
 */
function devTransform(
  twConfigPath: string,
  state: Babel.PluginPass,
  paths: Babel.NodePath<babel.types.Node>[],
  t: typeof Babel.types,
  tailwindObjectStyle: ReturnType<typeof initDevTailwindObjectstyles>
) {
  const path = state.file.path;
  //create tailwindconfig importDeclaration:
  //import tailwindconfig from "ABSULUTEPATH/tailwind.config";
  const tailwindConfigUid = path.scope.generateUidIdentifier("tailwindconfig");
  const tailwindConfigImport = t.importDeclaration(
    [t.importDefaultSpecifier(tailwindConfigUid)],
    t.stringLiteral(twConfigPath)
  );

  const devTwUid = path.scope.generateUidIdentifier("devTw");
  const devTwImport = t.importDeclaration(
    [t.importDefaultSpecifier(devTwUid)],
    t.stringLiteral("xwind/lib/objectstyles/dev/devMergeObjectstyles")
  );

  const devTwObjectstylesUid = path.scope.generateUidIdentifier(
    "devTwObjectstyles"
  );
  const devTwObjectstylesImport = t.importDeclaration(
    [t.importDefaultSpecifier(devTwObjectstylesUid)],
    t.stringLiteral("xwind/lib/objectstyles/dev/devObjectstyles")
  );

  //add devImports nodes to the file
  const programParentNode = path.scope.getProgramParent().path
    .node as Babel.types.Program;

  programParentNode.body.unshift(
    tailwindConfigImport,
    devTwImport,
    devTwObjectstylesImport
  );

  const objectstyles: { [key: string]: ObjectStyle } = {};

  for (const path of paths) {
    const args = getArgs(path);
    const classObjectstyles = tailwindObjectStyle(args);
    const twClasses = [];
    const memberExpressions = [];
    for (const [twClass, objectstyle] of classObjectstyles) {
      objectstyles[twClass] = objectstyle;
      twClasses.push(twClass);
      memberExpressions.push(
        t.memberExpression(devTwObjectstylesUid, t.stringLiteral(twClass), true)
      );
    }
    const replacementAst = t.callExpression(devTwUid, [
      tailwindConfigUid,
      t.valueToNode(twClasses),
      ...memberExpressions,
    ]);
    path.parentPath.replaceWith(replacementAst);
  }

  const cachedObjectstyles = importFresh("./devObjectstyles") as {
    default: {
      [key: string]: ObjectStyle;
    };
  };

  generateDevCorePlugins({ ...cachedObjectstyles.default, ...objectstyles });
}

export default devTransform;
