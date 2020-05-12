//Todo:
// - improve types and babel import
// - make more generic => have a banned plugin list
// - perf: check first if file has already been generated to avoid multiple transforms.

import fs from "fs";
import * as babel from "@babel/core";

/**
 * Generates/transforms the tailwindcss corePlugins file (https://github.com/tailwindcss/tailwindcss/blob/master/src/corePlugins.js)
 * It removes the preflight plugin and changes the imports.
 * The preflight plugin is not needed and doesn't work with hot reloading
 * because it uses fs module wich is not available.
 */
export function generateDevCorePlugins() {
  //get the original corePlugins file
  const pluginPath = require.resolve("tailwindcss/lib/corePlugins");
  const code = fs.readFileSync(pluginPath, "utf8");

  const output = babel.transformSync(code, {
    plugins: [
      function myCustomPlugin() {
        return {
          visitor: {
            VariableDeclarator(
              path: babel.NodePath<babel.types.VariableDeclarator>
            ) {
              //@ts-ignore
              const name = path.get("id").node.name;
              if (name.includes("preflight")) {
                path.parentPath.remove();
              }
            },
            ObjectProperty(path: babel.NodePath<babel.types.ObjectProperty>) {
              //@ts-ignore
              const name = path.get("key").node.name;
              if (name.includes("preflight")) {
                path.remove();
              }
            },
            StringLiteral(path: babel.NodePath<babel.types.StringLiteral>) {
              //@ts-ignore
              const name = path.get("value").node as string;
              if (name.includes("./")) {
                const replacement = name.replace("./", "tailwindcss/lib/");
                path.replaceWith(babel.types.stringLiteral(replacement));
              }
            },
          },
        };
      },
    ],
  });

  //get path to devCorePlugins
  const devCorePluginPath = require.resolve(
    "@tailwindcssinjs/macro/lib/devCorePlugins"
  );

  //overwrite current devCorePlugins file with transformed code
  fs.writeFileSync(devCorePluginPath, output?.code, "utf8");
}
