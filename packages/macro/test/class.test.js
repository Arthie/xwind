const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");

const tailwindcss_data_1 = require("@tailwindcssinjs/tailwindcss-data");
const transformers_1 = require("@tailwindcssinjs/transformers");

const tailwindConfig = tailwindcss_data_1.resolveTailwindConfig();

const tailwindcssInJs = (config) => {
  const { resolvedConfig, mediaScreens, variants, applyVariant, componentsRoot, utilitiesRoot, } = tailwindcss_data_1.tailwindData(config);
  const transformedComponents = transformers_1.transformPostcssRootToTwObjects(componentsRoot, "component");
  const transformedUtilities = transformers_1.transformPostcssRootToTwObjects(utilitiesRoot, "utility");
  const tsStyleObjectMap = transformers_1.transformTwObjectsToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities,
  ]);

  let help = []
  for (const key of tsStyleObjectMap.keys()) {
    help.push(
      [key,
        {
          code: `
      import tw from '../lib/macro';
      const css = tw("${key}");
      `,
          snapshot: true,
        }]
    )
  }
  return Object.fromEntries(help)
};

const test = tailwindcssInJs(tailwindConfig)

pluginTester.default({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: test
});