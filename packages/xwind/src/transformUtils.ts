import Babel from "@babel/core";

import initClassUtilities, { TwClasses } from "@xwind/class-utilities";
import core, {
  createTwClassDictionary,
  Objectstyle,
  mergeObjectstyles,
  transformTwRootToObjectstyle,
} from "@xwind/core";
import { getTwConfigCache } from "./tailwindConfig";
import { resolveXwindConfig } from "./xwindConfig";

export function getArgs(referencePath: Babel.NodePath<Babel.types.Node>) {
  if (!referencePath.isIdentifier()) {
    throw new Error("Reference path is not identifier");
  }

  const twClasses: string[][] = [];

  const path = referencePath.parentPath;
  if (path.isCallExpression()) {
    const argumentPaths = path.get("arguments");
    if (Array.isArray(argumentPaths)) {
      for (const argumentPath of argumentPaths) {
        const { confident, value } = argumentPath.evaluate();
        if (!confident)
          throw new Error(
            `Value of "${argumentPath.getSource()}" could not be statically evaluated.`
          );
        twClasses.push(value);
      }
    }
  }

  if (path.isTaggedTemplateExpression()) {
    const quasiPath = path.get("quasi");
    if (!Array.isArray(quasiPath)) {
      const { confident, value } = quasiPath.evaluate();
      if (!confident)
        throw new Error(
          `Value of "${quasiPath.getSource()}" could not be statically evaluated.`
        );
      twClasses.push(value);
    }
  }

  return twClasses;
}

type Transformer = (
  paths: Babel.NodePath<babel.types.Node>[],
  state: Babel.PluginPass,
  t: typeof Babel.types
) => void;

let $transfromer: Transformer;

export function getCachedTransformer(twConfigPath: string) {
  const { twConfig, isNewTwConfig } = getTwConfigCache(twConfigPath);
  if (!$transfromer || isNewTwConfig) {
    const xwConfig = resolveXwindConfig(twConfigPath, twConfig);
    const {
      screens,
      variants,
      baseRoot,
      componentsRoot,
      utilitiesRoot,
      generateTwClassSubstituteRoot,
    } = core(twConfig);

    const twClassesUtils = initClassUtilities(twConfig.separator, [
      ...screens,
      ...variants,
    ]);

    if (xwConfig.mode === "classes") {
      $transfromer = function transformClasses(
        paths: Babel.NodePath<babel.types.Node>[],
        state: Babel.PluginPass,
        t: typeof Babel.types
      ) {
        const twClasses = [];
        for (const path of paths) {
          const args = getArgs(path);
          const serializedTwClasses = twClassesUtils.serializer(args);
          path.parentPath.replaceWith(t.stringLiteral(serializedTwClasses));
          twClasses.push(serializedTwClasses);
        }
        //@ts-expect-error
        state.file.metadata.xwind = twClassesUtils.serializer(twClasses);
      };
    }

    if (xwConfig.mode === "objectstyles") {
      const warningCache = xwConfig.objectstyles?.warningCache ?? true;
      const isDev = process.env.NODE_ENV === "development" && warningCache;
      const twClassDictionary = {
        XWIND_BASE: createTwClassDictionary(baseRoot).XWIND_GLOBAL,
        ...createTwClassDictionary(componentsRoot, utilitiesRoot),
      };

      const tailwindObjectstyles = (twClasses: TwClasses) => {
        const parsedTwClasses = twClassesUtils.parser(twClasses);
        const composedTwClasses = twClassesUtils.composer(twClasses);

        const objectstyles: Objectstyle[] = [];
        for (const parsedTwClass of parsedTwClasses) {
          const twRoot = generateTwClassSubstituteRoot(
            twClassDictionary,
            parsedTwClass
          );
          objectstyles.push(
            transformTwRootToObjectstyle(parsedTwClass.class, twRoot)
          );
        }

        let objectstyle = mergeObjectstyles(objectstyles);

        if (twConfig.xwind?.objectstyles?.plugins) {
          for (const plugin of twConfig.xwind.objectstyles.plugins) {
            objectstyle = plugin(objectstyle, composedTwClasses, twConfig);
          }
        }

        return objectstyle;
      };

      $transfromer = (
        paths: Babel.NodePath<babel.types.Node>[],
        state: Babel.PluginPass,
        t: typeof Babel.types
      ) => {
        if (isDev) {
          const path = state.file.path;
          //create tailwindconfig importDeclaration:
          //import tailwindconfig from "ABSULUTEPATH/tailwind.config";
          const tailwindConfigUid = path.scope.generateUidIdentifier(
            "tailwindconfig"
          );
          const tailwindConfigImport = t.importDeclaration(
            [t.importDefaultSpecifier(tailwindConfigUid)],
            t.stringLiteral(twConfigPath)
          );

          const devXwUid = path.scope.generateUidIdentifier("devXwUid");
          const devXwImport = t.importDeclaration(
            [t.importDefaultSpecifier(devXwUid)],
            t.stringLiteral("xwind/lib/objectstyles/devXwind")
          );

          const callDevXw = t.expressionStatement(
            t.callExpression(devXwUid, [tailwindConfigUid])
          );

          //add devImports nodes to the file
          const programParentNode = path.scope.getProgramParent().path
            .node as Babel.types.Program;

          programParentNode.body.unshift(
            tailwindConfigImport,
            devXwImport,
            callDevXw
          );
        }

        for (const path of paths) {
          const args = getArgs(path);
          const objectstyles = tailwindObjectstyles(args);
          path.parentPath.replaceWith(t.valueToNode(objectstyles));
        }
      };
    }
  }

  return $transfromer;
}
