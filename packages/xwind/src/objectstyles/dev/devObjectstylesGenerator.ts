import fs from "fs";
import Babel, { transformSync } from "@babel/core";
import { ObjectStyle } from "@xwind/core";

//TODO use json file instead???
function generateDevCorePlugins(objectstyles: { [key: string]: ObjectStyle }) {
  const devObjectstylesPlugin = function (
    babel: typeof Babel,
    config: any,
    workingPath: string
  ): Babel.PluginObj<Babel.PluginPass> {
    const { types: t } = babel;
    return {
      name: "devObjectstylesPlugin",
      visitor: {
        AssignmentExpression(path, state) {
          if (path.node.left.type !== "MemberExpression") {
            return;
          }

          if (path.node.left.property.type !== "Identifier") {
            return;
          }

          if (path.node.left.property.name !== "default") {
            return;
          }

          if (path.node.right.type !== "ObjectExpression") {
            return;
          }

          if (path.node.right.properties.length) {
            return;
          }

          path.replaceWith(
            t.assignmentExpression(
              path.node.operator,
              path.node.left,
              t.valueToNode(objectstyles)
            )
          );
        },
      },
    };
  };

  const code = `
    "use strict";
    // DO NOT CHANGE THIS FILE
    // This file will be generated/overwritten when NODE_ENV is set to development and development mode is enabled
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {};
    //# sourceMappingURL=devObjectstyles.js.map
  `;

  const output = transformSync(code, {
    filename: "devObjectstyles.js",
    plugins: [devObjectstylesPlugin],
  });

  //get path to devCorePlugins
  const devObjectstylesPath = require.resolve(
    "xwind/lib/objectstyles/dev/devObjectstyles"
  );

  //overwrite current devCorePlugins file with transformed code
  if (output?.code) {
    fs.writeFileSync(devObjectstylesPath, output.code, "utf8");
  }
}

export default generateDevCorePlugins;
