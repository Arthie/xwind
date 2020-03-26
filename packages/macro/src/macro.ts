// https://github.com/knpwrs/ms.macro/blob/master/src/ms.macro.js

import { createMacro, MacroError, MacroHandler } from "babel-plugin-macros";
import { transformStyleObjectToCssString } from "@tailwindcssinjs/transformers";
import { resolveTailwindConfig } from "@tailwindcssinjs/tailwindcss-data";

import { tailwindcssInJs } from "./tailwindcssInJs";

const defaultConfig = {
  format: "object",
  strictVariants: false,
};

const getArgs = (path: any) => {
  if (path.type === "CallExpression") {
    const args = path
      .get("arguments")
      .map((item: any) => item.evaluate().value);
    return args;
  }

  if (path.type === "TaggedTemplateExpression") {
    const quasi = path.get("quasi");

    const templateElements = quasi
      .get("quasis")
      .map((item: any) => item.node.value.raw);
    const expressions = quasi
      .get("expressions")
      .map((item: any) => item.evaluate().value);
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
  return null;
};

const tailwindcssInJsMacro: MacroHandler = ({
  references: { default: paths },
  state,
  babel: { types: t, template },
  //@ts-ignore
  config,
}) => {
  try {
    if (!config?.format) {
      config.format = defaultConfig.format;
    }
    if (!config?.strictVariants) {
      config.strictVariants = defaultConfig.strictVariants;
    }

    const tailwindConfig = resolveTailwindConfig();

    const tailwind = tailwindcssInJs(tailwindConfig, config.strictVariants);

    paths.forEach((referencePath) => {
      const args = getArgs(referencePath.parentPath);
      const cssObj = tailwind(...args);

      if (config.format === "object") {
        const ast = template.expression(JSON.stringify(cssObj), {
          placeholderPattern: false,
        })();
        referencePath.parentPath.replaceWith(ast);
      }

      if (config.format === "string") {
        const css = transformStyleObjectToCssString(cssObj);
        referencePath.parentPath.replaceWith(t.stringLiteral(css));
      }
    });
  } catch (err) {
    throw new MacroError(err);
  }
};

export default createMacro(tailwindcssInJsMacro, {
  configName: "tailwindcssinjs",
});
