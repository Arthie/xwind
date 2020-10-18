import Babel, { PluginObj, PluginPass } from "@babel/core";
import {
  requireTailwindConfig,
  resolveTailwindConfigPath,
  TailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data";
import { tailwindcssinjs } from "./tailwindcssinjs";

/**
 * tries to get tailwind config and stores config in state
 * if it fails it stores default config in state
 * @param state
 * @param config
 */
function getTailwindConfig(config: string) {
  try {
    const resolvedConfigPath = resolveTailwindConfigPath(config);
    return requireTailwindConfig(resolvedConfigPath);
  } catch (err) {
    return requireTailwindConfig(); //returns default config
  }
}

//todo: check if file exists if not error

export interface PluginConfig {
  output?: string;
  config?: string;
}

// https://stackoverflow.com/a/32749533/971592
class PluginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "@tailwindcssinjsPluginError";
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else if (!this.stack) {
      this.stack = new Error(message).stack;
    }
  }
}

interface PluginState {
  outputPath: string;
  configPath: string;
  importDefaultSpecifier?: string;
  config: TailwindConfig;
  tailwind: any;
}

export default function (
  { types: t }: typeof Babel,
  config: PluginConfig
): PluginObj<PluginPass> {
  let pluginState: PluginState;
  return {
    name: "tailwindcssinjs",
    pre(state) {
      // console.log("PRE", state)
      // console.log("gen config", pluginState)
      const outputPath = config.output;
      const configPath = config.config ?? "./tailwind.config.js";
      if (!outputPath)
        throw new PluginError("Add output to @tailwindcssinjs plugin options");
      const tailwindConfig = getTailwindConfig(configPath);
      pluginState = {
        outputPath,
        configPath,
        config: tailwindConfig,
        tailwind: tailwindcssinjs(tailwindConfig, outputPath),
      };
    },
    visitor: {
      ImportDeclaration(path, state) {
        // console.log("Import", state)
        const source = path.get("source");
        if (source.node.value === "@tailwindcssinjs/css") {
          const specifiers = path.get("specifiers");
          const importDefaultSpecifier = specifiers.find(
            (specifier) => specifier.type === "ImportDefaultSpecifier"
          ) as Babel.NodePath<Babel.types.ImportDefaultSpecifier> | undefined;
          if (importDefaultSpecifier) {
            pluginState.importDefaultSpecifier = importDefaultSpecifier.get(
              "local"
            ).node.name;
            importDefaultSpecifier.remove();
          }
          if (path.get("specifiers").length === 0) {
            path.remove();
          }
        }
      },
      TaggedTemplateExpression(path, state) {
        const tag = path.get("tag");
        if (
          tag.node.type === "Identifier" &&
          pluginState.importDefaultSpecifier &&
          tag.node.name === pluginState.importDefaultSpecifier
        ) {
          const quasi = path.get("quasi");
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
          // console.log("TAG", state, twClasses)
          path.replaceWith(
            t.stringLiteral(pluginState.tailwind.setClasses(twClasses))
          );
        }
      },
    },
    post(state) {
      // console.log("POST", state)
      if (pluginState.outputPath) {
        pluginState.tailwind.writeCSS();
      }
    },
  };
}
