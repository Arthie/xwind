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
      const css = tw('w-1/2 bg-blue-500 scale-0 active:bg-red-300 lg:hover[text-red-200 bg-blue-500]', ['lg:text-red-300',"focus:bg-green-300"], "md:bg-green-300");
    `,
    "correct usage 2": `
      import tw from '../lib/macro';
      const css = tw("m-0 mr-4 text-red-400 transform -translate-y-1/2 lg:hover[bg-blue-100 text-red-200]");
    `,
    "correct usage tagged": `
      import tw from '../lib/macro';
      const css = tw\`m-0 mr-4 text-red-400 transform -translate-y-1/2 lg:hover[bg-blue-100 text-red-200]\`;
    `,
    components: `
      import tw from '../lib/macro';
      const css = tw\`container\`
    `,
    "variant class not allowed": {
      code: `
      import tw from '../lib/macro';
      const css = tw\`md[container]\`
      `,
      snapshot: true,
      error: /Variant class/,
    },
    "class not found error": {
      code: `
      import tw from '../lib/macro';
      const css = tw\`lol\`
      `,
      snapshot: true,
      error: /not found/,
    },
    "version 1.3.X test 1": `
      import tw from '../lib/macro';
      const css = tw\`group-focus:text-red-100 delay-1000 space-y-4 flex space-x-2 divide-x divide-y divide-blue-500 space-x-reverse\`
      `,
    "version 1.3.X test 2": `
      import tw from '../lib/macro';
      const css = tw\`group-focus:text-red-100 md:delay-1000 md:space-y-4 md:space-x-2 md:divide-x md:divide-y md:divide-blue-500 md:space-x-reverse\`
      `,
  },
});
