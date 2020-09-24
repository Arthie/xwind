import pluginTester from "babel-plugin-tester";
import plugin from "babel-plugin-macros";
import {
  requireTailwindConfig,
  resolveTailwindConfigPath,
  tailwindData,
  transformPostcssRootsToTwObjectMap,
} from "@tailwindcssinjs/tailwindcss-data";
import corePlugins from "tailwindcss/lib/corePlugins";

const tests = () => {
  const tailwindConfigPath = resolveTailwindConfigPath("./tailwind.config.js");

  const tailwindConfig = requireTailwindConfig(tailwindConfigPath);

  const { componentsRoot, utilitiesRoot } = tailwindData(
    tailwindConfig,
    corePlugins
  );

  const twObjectMap = transformPostcssRootsToTwObjectMap([
    utilitiesRoot,
    componentsRoot,
  ]);

  let tests = [];
  for (const key of twObjectMap.keys()) {
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

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: tests(),
});
