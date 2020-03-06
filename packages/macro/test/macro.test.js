const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");

pluginTester.default({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: {
    "no usage": `import tw from '../dist/macro'`,
    "correct usage": `
      import tw from '../dist/macro';
      const css = tw('bg-blue-500', {lg:"bg-blue-500", "lg:hover":"bg-red-300"}, 'lg:text-red-300',"focus:bg-green-300", "md:bg-green-300");
    `,
    // "correct usage 1": `
    //   import tw from '../dist/macro';
    //   const css = tw\`\${{ focus: "bg-red-200" }} text-red-100 bg-red-100 \${{
    //     hover: "text-red-200"
    //   }} focus:text-red-300\`;
    // `,
  },
});