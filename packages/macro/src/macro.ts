import { NodePath, types, PluginPass } from "@babel/core";
import { createMacro, MacroError, MacroParams } from "babel-plugin-macros";

import corePlugins from "tailwindcss/lib/corePlugins";

import {
  resolveTailwindConfigPath,
  requireTailwindConfig,
  TailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig";

import {
  twClassesSerializer,
  TwClasses,
} from "@tailwindcssinjs/class-composer";

import tailwindcssinjs from "./tailwindcssinjs";
import { generateDevCorePlugins } from "./devCorePluginsGenerator";

/**
 * Returns tailwind classes from macro arguments
 * @param path
 */
function getArgs(path: NodePath<types.Node>): TwClasses {
  if (path.type === "CallExpression") {
    const node = path as NodePath<types.CallExpression>;
    return node.get("arguments").map((item) => item.evaluate().value);
  }

  if (path.type === "TaggedTemplateExpression") {
    const node = path as NodePath<types.TaggedTemplateExpression>;
    const quasi = node.get("quasi");
    const templateElements = quasi
      .get("quasis")
      .map((item) => item.node.value.raw);

    const expressions = quasi
      .get("expressions")
      .map((item) => item.evaluate().value);
    const twClasses = [];
    while (templateElements.length || expressions.length) {
      const twClassString = templateElements.shift();
      const twClassObject = expressions.shift();
      if (twClassString) {
        twClasses.push(twClassString);
      }
      if (twClassObject) {
        twClasses.push(twClassObject);
      }
    }
    return twClasses;
  }

  throw new Error("Invalid Nodepath");
}

/**
 * Add development imports to the file this enables hot reloading on config changes
 *
 * Example imports:
 * import tailwindconfig from "ABSULUTEPATH/tailwind.config";
 * import devCorePluginsCreator from "@tailwindcssinjs/macro/lib/devCorePluginsCreator"
 * import tailwindcssinjs from "@tailwindcssinjs/macro/lib/tailwindcssinjs";
 * const tw = tailwindcssinjs(tailwindconfig, devCorePluginsCreator);
 * @param referencePath
 * @param t
 * @param state
 */
function addDevImports(
  referencePath: NodePath<types.Node>,
  t: typeof types,
  state: TailwindMacroParamsState
) {
  //check if file already has dev imports
  if (!state.tailwindDevTwUid) {
    //create tailwindconfig importDeclaration:
    //import tailwindconfig from "ABSULUTEPATH/tailwind.config";
    const tailwindConfigUid = referencePath.scope.generateUidIdentifier(
      "tailwindconfig"
    );
    const tailwindConfigImport = t.importDeclaration(
      [t.importDefaultSpecifier(tailwindConfigUid)],
      t.stringLiteral(
        state.tailwindConfigPath
          ? state.tailwindConfigPath
          : "tailwindcss/defaultConfig"
      )
    );

    //create devCorePluginsCreator importDeclaration:
    //import devCorePluginsCreator from "@tailwindcssinjs/macro/lib/devCorePluginsCreator"
    const devCorePluginsCreatorUid = referencePath.scope.generateUidIdentifier(
      "devCorePluginsCreator"
    );
    const corePluginsImport = t.importDeclaration(
      [t.importDefaultSpecifier(devCorePluginsCreatorUid)],
      t.stringLiteral("@tailwindcssinjs/macro/lib/devCorePluginsCreator")
    );

    //create tailwindcssinjs importDeclaration:
    //import tailwindcssinjs from "@tailwindcssinjs/macro/lib/tailwindcssinjs";
    const tailwindcssinjsUid = referencePath.scope.generateUidIdentifier(
      "tailwindcssinjs"
    );
    const tailwindcssinjsImport = t.importDeclaration(
      [t.importDefaultSpecifier(tailwindcssinjsUid)],
      t.stringLiteral("@tailwindcssinjs/macro/lib/tailwindcssinjs")
    );

    //create tw variableDeclaration:
    //const tw = tailwindcssinjs(tailwindconfig, devCorePluginsCreator);
    const twUid = referencePath.scope.generateUidIdentifier("tw");
    const twConst = t.variableDeclaration("const", [
      t.variableDeclarator(
        twUid,
        t.callExpression(tailwindcssinjsUid, [
          tailwindConfigUid,
          devCorePluginsCreatorUid,
        ])
      ),
    ]);

    //store uids in state
    state.tailwindDevTwUid = twUid;

    //add devImports nodes to the file
    //@ts-expect-error fix type
    state.file.path.node.body.unshift(
      tailwindConfigImport,
      corePluginsImport,
      tailwindcssinjsImport,
      twConst
    );
  }
}

/**
 * tries to get tailwind config and stores config in state
 * if it fails it stores default config in state
 * @param state
 * @param config
 */
function getTailwindConfig(state: TailwindMacroParamsState, config: string) {
  try {
    state.tailwindConfigPath = resolveTailwindConfigPath(config);
    return requireTailwindConfig(state.tailwindConfigPath);
  } catch (err) {
    return requireTailwindConfig(); //returns default config
  }
}

interface TailwindMacroParamsState extends PluginPass {
  configPath?: string;
  developmentMode?: boolean;
  isDev?: boolean;
  tailwindConfigPath?: string;
  tailwindConfig?: TailwindConfig;
  tailwind?: (arg: TwClasses) => any;
  tailwindDevTwUid?: types.Identifier;
}

interface TailwindcssinjsMacroParams extends MacroParams {
  config?: {
    config?: string;
    developmentMode?: boolean;
  };
  state: TailwindMacroParamsState;
}

function tailwindcssinjsMacro({
  references: { default: paths },
  state,
  babel: { types: t },
  config,
}: TailwindcssinjsMacroParams) {
  try {
    state.configPath = config?.config ?? "./tailwind.config.js";
    state.developmentMode = config?.developmentMode ?? true;
    state.isDev =
      process.env.NODE_ENV === "development" && state.developmentMode;

    state.tailwindConfig = getTailwindConfig(state, state.configPath);

    if (state.isDev) {
      generateDevCorePlugins();
    } else {
      state.tailwind = tailwindcssinjs(state.tailwindConfig, corePlugins);
    }

    paths.forEach((referencePath) => {
      const args = getArgs(referencePath.parentPath);
      if (state.isDev) {
        addDevImports(referencePath, t, state);
        const serialisedArgs = twClassesSerializer(
          state.tailwindConfig?.separator ?? ":"
        )(args);

        if (state.tailwindDevTwUid) {
          const replacementAst = t.callExpression(state.tailwindDevTwUid, [
            t.stringLiteral(serialisedArgs),
          ]);
          referencePath.parentPath.replaceWith(replacementAst);
        }
      } else if (state.tailwind) {
        const style = state.tailwind(args);
        referencePath.parentPath.replaceWith(t.valueToNode(style));
      }
    });
  } catch (err) {
    err.message = `@tailwindcssinjs/macro - ${err.message}`;
    throw new MacroError(err);
  }
}

export default createMacro(tailwindcssinjsMacro, {
  configName: "tailwindcssinjs",
});
