const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");

("use strict");
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const tailwindcss_data_1 = require("@tailwindcssinjs/tailwindcss-data");
const transformers_1 = require("@tailwindcssinjs/transformers");

let configCache = Buffer.from("");
let tailwind;
let configPath;

const tailwindcssInJs = () => {
  //check for config
  try {
    configPath = tailwindcss_data_1.resolveTailwindConfigPath();
  } catch (err) {
    configPath = undefined;
  }
  //check if config has changed
  let configHasChanged;
  if (configPath) {
    const configfile = fs_1.default.readFileSync(configPath);
    configHasChanged = !configCache.equals(configfile);
    if (configHasChanged) {
      if (configCache.length > 0)
        console.log(
          "@tailwindcssinjs/macro - Tailwind config has been changed"
        );
      configCache = configfile;
    }
  }
  if (configHasChanged || !tailwind) {
    const config = tailwindcss_data_1.resolveTailwindConfig(configPath);
    const { componentsRoot, utilitiesRoot } = tailwindcss_data_1.tailwindData(
      config
    );
    const transformedComponents = transformers_1.transformPostcssRootToTwObjects(
      componentsRoot,
      "component"
    );
    const transformedUtilities = transformers_1.transformPostcssRootToTwObjects(
      utilitiesRoot,
      "utility"
    );
    const tsStyleObjectMap = transformers_1.transformTwObjectsToTwStyleObjectMap(
      [...transformedComponents, ...transformedUtilities]
    );

    let help = [];
    for (const key of tsStyleObjectMap.keys()) {
      help.push([
        key,
        {
          code: `
      import tw from '../lib/macro';
      const css = tw("${key}");
      `,
          snapshot: true,
        },
      ]);
    }
    tailwind = Object.fromEntries(help);
  }
  return tailwind;
};

const tests = tailwindcssInJs();

pluginTester.default({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests,
});
