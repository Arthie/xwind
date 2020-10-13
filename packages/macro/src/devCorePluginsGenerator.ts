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
  const pluginPath = require.resolve("tailwindcss/lib/plugins");
  const code = fs.readFileSync(pluginPath, "utf8");

  const output = babel.transformSync(code, {
    filename: "devCorePlugins.js",
    plugins: [
      function myCustomPlugin() {
        return {
          visitor: {
            StringLiteral(path: babel.NodePath<babel.types.StringLiteral>) {
              const name = path.node.value;
              if (name.startsWith("./")) {
                const replacement = name.replace(
                  "./",
                  "tailwindcss/lib/plugins/"
                );
                path.replaceWith(babel.types.stringLiteral(replacement));
              }
              if (name === "preflight" || name === "./preflight") {
                const rootPath = path.findParent(
                  (path) => path.parent.type === "Program"
                );
                rootPath?.remove();
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
  if (output?.code) {
    fs.writeFileSync(devCorePluginPath, output.code, "utf8");
  }
}
