import { NodePath, types } from "@babel/core";
import { createMacro, MacroError, MacroHandler } from "babel-plugin-macros";

import { tailwindcssInJs } from "./tailwindcssInJs";

const getArgs = (path: NodePath<types.Node>) => {
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
};

const tailwindcssInJsMacro: MacroHandler = ({
  references: { default: paths },
  state,
  babel: { types: t, template },
}) => {
  try {
    const tailwind = tailwindcssInJs();

    paths.forEach((referencePath) => {
      const args = getArgs(referencePath.parentPath);
      const cssObj = tailwind(args);

      const ast = template.expression(JSON.stringify(cssObj), {
        placeholderPattern: false,
      })();
      referencePath.parentPath.replaceWith(ast);
    });
  } catch (err) {
    err.message = `@tailwindcssinjs/macro - ${err.message}`;
    throw new MacroError(err);
  }
};

export default createMacro(tailwindcssInJsMacro, {
  configName: "tailwindcssinjs",
});
