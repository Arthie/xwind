import Babel from "@babel/core";

import initClassUtilities, { TwClasses } from "@xwind/class-utilities";
import core, {
  createTwClassDictionary,
  ObjectStyle,
  mergeObjectStyles,
  transformTwRootToObjectStyle,
} from "@xwind/core";
import { getTwConfigCache } from "./tailwindConfig";
import devTransformObjectstyles from "./objectstyles/dev/devTransform";
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
      const twClassDictionary = createTwClassDictionary(
        componentsRoot,
        utilitiesRoot
      );

      const developmentMode = xwConfig.objectstyles?.developmentMode ?? true;
      const isDev = process.env.NODE_ENV === "development" && developmentMode;

      if (isDev) {
        const devTailwindObjectstyles = (twClasses: TwClasses) => {
          const parsedTwClasses = twClassesUtils.parser(twClasses);
          const objectStyles: [string, ObjectStyle][] = [];
          for (const parsedTwClass of parsedTwClasses) {
            console.log(parsedTwClass);
            const twRoot = generateTwClassSubstituteRoot(
              twClassDictionary,
              parsedTwClass
            );
            const [twClass] = twClassesUtils.generator(parsedTwClass);
            objectStyles.push([
              twClass,
              transformTwRootToObjectStyle(parsedTwClass.class, twRoot),
            ]);
          }
          return objectStyles;
        };

        $transfromer = (
          paths: Babel.NodePath<babel.types.Node>[],
          state: Babel.PluginPass,
          t: typeof Babel.types
        ) =>
          devTransformObjectstyles(
            twConfigPath,
            paths,
            state,
            t,
            devTailwindObjectstyles
          );
      } else {
        const tailwindObjectstyles = (twClasses: TwClasses) => {
          const parsedTwClasses = twClassesUtils.parser(twClasses);
          const composedTwClasses = twClassesUtils.composer(twClasses);

          const objectStyles: ObjectStyle[] = [];
          for (const parsedTwClass of parsedTwClasses) {
            const twRoot = generateTwClassSubstituteRoot(
              twClassDictionary,
              parsedTwClass
            );
            objectStyles.push(
              transformTwRootToObjectStyle(parsedTwClass.class, twRoot)
            );
          }

          let objectStyle = mergeObjectStyles(objectStyles);

          if (twConfig.xwind?.objectstyles?.plugins) {
            for (const plugin of twConfig.xwind.objectstyles.plugins) {
              objectStyle = plugin(objectStyle, composedTwClasses, twConfig);
            }
          }

          return objectStyle;
        };

        $transfromer = (
          paths: Babel.NodePath<babel.types.Node>[],
          state: Babel.PluginPass,
          t: typeof Babel.types
        ) => {
          for (const path of paths) {
            const args = getArgs(path);
            const style = tailwindObjectstyles(args);
            path.parentPath.replaceWith(t.valueToNode(style));
          }
        };
      }
    }
  }

  return $transfromer;
}
