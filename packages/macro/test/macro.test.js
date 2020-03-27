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
      const css = tw('w-1/2 bg-blue-500 scale-0 active:bg-red-300', {lg:"bg-blue-500", "lg:hover":"bg-red-300"}, 'lg:text-red-300',"focus:bg-green-300", "md:bg-green-300");
    `,
    "correct usage 2": `
      import tw from '../lib/macro';
      const css = tw("m-0 mr-4");
    `
  },
});