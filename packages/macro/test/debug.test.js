const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");

pluginTester.default({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: {
    "no usage": `import tw from '../lib/macro'`,
    "correct usage 1": `
      import tw from '../lib/macro';
      const css = tw("sm:motion-reduce:translate-y-0 motion-reduce:hover:translate-y-0 md:motion-reduce:hover:translate-y-0");
      `,
  },
});
