import pluginTester from "babel-plugin-tester";
import plugin from "../lib/babel";

import core, { createTwClassDictionary, resolveConfig } from "@xwind/core";

const tests = () => {
  const resolvedConfig = resolveConfig({});
  const { utilitiesRoot, componentsRoot } = core(resolvedConfig);
  const twObjectMap = createTwClassDictionary(utilitiesRoot, componentsRoot);

  let tests = [];
  for (const key of Object.keys(twObjectMap)) {
    tests.push([
      key,
      {
        code: `
      import xw from 'xwind';
      const css = xw\`${key}\`;
      `,
        snapshot: true,
      },
    ]);
  }
  return Object.fromEntries(tests);
};

pluginTester({
  plugin,
  pluginName: "xwind",
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  pluginOptions: {
    config: "./config/tailwindconfigs/objectstyles.js",
  },
  tests: tests(),
});
