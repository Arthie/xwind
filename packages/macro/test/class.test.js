("use strict");
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });

const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");

const tailwindcssData_1 = require("@tailwindcssinjs/tailwindcss-data/lib/tailwindcssData");
const transformers_1 = require("@tailwindcssinjs/transformers");
const resolveConfig_1 = __importDefault(require("tailwindcss/resolveConfig"));

const tailwindcssConfig_1 = require("@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig");
const corePlugins_1 = __importDefault(require("tailwindcss/lib/corePlugins"));

function tailwindcssinjs(config, corePlugins) {
  const resolvedConfig = resolveConfig_1.default(config);
  const { componentsRoot, utilitiesRoot } = tailwindcssData_1.tailwindData(
    resolvedConfig,
    corePlugins(resolvedConfig)
  );
  const transformedComponents = transformers_1.transformPostcssRootToTwObjects(
    componentsRoot,
    "component"
  );
  const transformedUtilities = transformers_1.transformPostcssRootToTwObjects(
    utilitiesRoot,
    "utility"
  );
  const twStyleObjectMap = transformers_1.transformTwObjectsToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities,
  ]);

  return twStyleObjectMap;
}

const tests = () => {
  const tailwindConfigPath = tailwindcssConfig_1.resolveTailwindConfigPath();
  const tailwindConfig = tailwindcssConfig_1.requireTailwindConfig(
    tailwindConfigPath
  );
  const twStyleObjectMap = tailwindcssinjs(
    tailwindConfig,
    corePlugins_1.default
  );

  let tests = [];
  for (const key of twStyleObjectMap.keys()) {
    tests.push([
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
  return Object.fromEntries(tests);
};

pluginTester.default({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: tests(),
});
