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
      const css = tw('w-1/2 bg-blue-500 scale-0 active:bg-red-300 lg:hover[text-red-200 bg-blue-500]', 'lg:text-red-300',"focus:bg-green-300", "md:bg-green-300");
    `,
    "correct usage 2": `
      import tw from '../lib/macro';
      const css = tw("m-0 mr-4 text-red-400 transform -translate-y-1/2 lg:hover[bg-blue-100 text-red-200]");
    `,
    "correct usage tagged": `
      import tw from '../lib/macro';
      const css = tw\`m-0 mr-4 text-red-400 transform -translate-y-1/2 lg:hover[bg-blue-100 text-red-200]\`;
    `
  },
});