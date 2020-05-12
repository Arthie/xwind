import { NodePath, types } from "@babel/core";
import { createMacro, MacroError, MacroParams } from "babel-plugin-macros";

import corePlugins from "tailwindcss/lib/corePlugins";

import {
  resolveTailwindConfigPath,
  requireTailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig";

import { twClassesSerializer } from "@tailwindcssinjs/class-composer";

import tailwindcssinjs from "./tailwindcssinjs";
import { generateDevCorePlugins } from "./devCorePluginsGenerator";

function getArgs(path: NodePath<types.Node>) {
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

function addDevImports(
  referencePath: NodePath<types.Node>,
  t: typeof types,
  state: any,
  config: any
) {
  // add these imports to the file
  // import tailwindconfig from "../../tailwind.config";
  // import devCorePlugins from "@tailwindcssinjs/macro/lib/devCorePlugins"
  // import tailwindcssinjs from "@tailwindcssinjs/macro/lib/tailwindcssinjs";
  // const tw = tailwindcssinjs(tailwindconfig, devCorePlugins, {fallbacks:true});

  const hasimports = state.tailwindUids.every((uid: types.Identifier) =>
    referencePath.scope.hasUid(uid.name)
  );

  if (state.tailwindUids.length === 0 || !hasimports) {
    const tailwindConfigUid = referencePath.scope.generateUidIdentifier(
      "tailwindconfig"
    );
    state.tailwindUids.push(tailwindConfigUid);
    const tailwindConfigImport = t.importDeclaration(
      [t.importDefaultSpecifier(tailwindConfigUid)],
      t.stringLiteral(
        state.tailwindConfigPath
          ? state.tailwindConfigPath
          : "tailwindcss/defaultConfig"
      )
    );

    const devCorePluginsUid = referencePath.scope.generateUidIdentifier(
      "devCorePlugins"
    );
    state.tailwindUids.push(devCorePluginsUid);
    const corePluginsImport = t.importDeclaration(
      [t.importDefaultSpecifier(devCorePluginsUid)],
      t.stringLiteral("@tailwindcssinjs/macro/lib/devCorePlugins")
    );

    const tailwindcssinjsUid = referencePath.scope.generateUidIdentifier(
      "tailwindcssinjs"
    );
    state.tailwindUids.push(tailwindcssinjsUid);
    const tailwindcssinjsImport = t.importDeclaration(
      [t.importDefaultSpecifier(tailwindcssinjsUid)],
      t.stringLiteral("@tailwindcssinjs/macro/lib/tailwindcssinjs")
    );

    const twUid = referencePath.scope.generateUidIdentifier("tw");
    state.tailwindUids.push(twUid);
    const twConst = t.variableDeclaration("const", [
      t.variableDeclarator(
        twUid,
        t.callExpression(tailwindcssinjsUid, [
          tailwindConfigUid,
          devCorePluginsUid,
          t.objectExpression([
            t.objectProperty(
              t.stringLiteral("fallbacks"),
              t.booleanLiteral(config.fallbacks)
            ),
          ]),
        ])
      ),
    ]);

    const program = state.file.path;
    program.node.body.unshift(
      tailwindConfigImport,
      corePluginsImport,
      tailwindcssinjsImport,
      twConst
    );
  }
}

interface TailwindcssinjsMacroParams extends MacroParams {
  config?: {
    config: string;
    experimentalDevelopmentMode: boolean;
    fallbacks: boolean;
  };
}
function tailwindcssinjsMacro({
  references: { default: paths },
  state,
  babel: { types: t, template },
  config = {
    config: "./tailwind.config.js",
    experimentalDevelopmentMode: false,
    fallbacks: true,
  },
}: TailwindcssinjsMacroParams) {
  config.config = config.config ?? "./tailwind.config.js";
  config.experimentalDevelopmentMode =
    config.experimentalDevelopmentMode ?? false;
  config.fallbacks = config.fallbacks ?? true;
  try {
    state.dev =
      process.env.NODE_ENV === "development" &&
      config.experimentalDevelopmentMode;

    //check for config
    try {
      state.tailwindConfigPath = resolveTailwindConfigPath(config.config);
      state.tailwindConfig = requireTailwindConfig(state.tailwindConfigPath);
      if (state.noTailwindConfig) {
        throw new Error(
          "Tailwind config was created please restart dev server"
        );
      }
    } catch (err) {
      //Check if tailwindconfig has been assigned so it logs only once
      if (!state.noTailwindConfig) {
        state.noTailwindConfig = true;
      }
      state.tailwindConfig = requireTailwindConfig(); //returns default config
    }

    if (state.dev) {
      generateDevCorePlugins();
    } else {
      state.tailwind = tailwindcssinjs(state.tailwindConfig, corePlugins, {
        fallbacks: config.fallbacks,
      });
    }
    state.tailwindUids = [];

    paths.forEach((referencePath) => {
      const args = getArgs(referencePath.parentPath);

      if (state.dev) {
        addDevImports(referencePath, t, state, config);
        const serialisedArgs = twClassesSerializer(
          state?.tailwindConfig?.separator ?? ":"
        )(args);
        const call = t.callExpression(state.tailwindUids[3], [
          t.stringLiteral(serialisedArgs),
        ]);
        referencePath.parentPath.replaceWith(call);
      } else {
        const cssObj = state.tailwind(args);

        const ast = template.expression(JSON.stringify(cssObj), {
          placeholderPattern: false,
        })();
        referencePath.parentPath.replaceWith(ast);
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
