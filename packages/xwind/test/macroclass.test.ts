import pluginTester from "babel-plugin-tester";
import plugin from "babel-plugin-macros";

import {
  tailwindData,
  createTwClassDictionary,
  resolveConfig,
} from "@xwind/core";

const tests = () => {
  const resolvedConfig = resolveConfig({});
  const { utilitiesRoot, componentsRoot } = tailwindData(resolvedConfig);
  const twObjectMap = createTwClassDictionary(utilitiesRoot, componentsRoot);

  let tests = [];
  for (const key of Object.keys(twObjectMap)) {
    tests.push([
      key,
      {
        code: `
      import xw from 'xwind/macro';
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
    xwind: {
      config: "./config/tailwindconfigs/objectstyles.js",
    },
  },
  tests: tests(),
});
