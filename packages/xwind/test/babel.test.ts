import pluginTester from "babel-plugin-tester";

import plugin from "../lib/babel";

const tailwindConfigs = {
  config: "./config/tailwindconfigs/tailwind.config.js",
  empty: "./config/tailwindconfigs/empty.js",
};

pluginTester({
  plugin,
  pluginName: "xwind",
  pluginOptions: {
    config: tailwindConfigs.config,
  },
  tests: [
    {
      //@ts-expect-error
      pluginOptions: {
        config: tailwindConfigs.empty,
      },
      title: "Empty xwind config object",
      code: `
        import xw from "xwind"
        const test = xw\`bg-red-100\`
      `,
      output: 'const test = "bg-red-100";',
      error: /No xwind config object found/,
    },
    // {
    //   title: "remove import",
    //   code: 'import tw from "xwind"',
    //   output: "",
    // },
    // {
    //   title: "other import",
    //   code: 'import { cx } from "xwind";',
    //   output: 'import { cx } from "xwind";',
    // },
    // {
    //   title: "other import2",
    //   code: `
    //     import tailwind from "xwind"
    //     const test = tailwind\`bg-red-200\`
    //   `,
    //   output: 'const test = "bg-red-200";',
    // },
    // {
    //   title: "test 1",
    //   code: `
    //     import tw from "xwind"
    //     const test = tw\`bg-red-500\`
    //   `,
    //   snapshot: true,
    // },
    // {
    //   title: "test error css",
    //   code: `
    //     import tw from "xwind"
    //     const test = tw\`bg-red-500\`
    //   `,
    //   error: /No CSS file found/,
    //   // @ts-expect-error
    //   pluginOptions: {
    //     output: "../test.css",
    //   },
    // },
    // {
    //   title: "test error config",
    //   code: `
    //     import tw from "xwind"
    //     const test = tw\`bg-red-500\`
    //   `,
    //   error: /No tailwid.config.js file found/,
    //   // @ts-expect-error
    //   pluginOptions: {
    //     config: "../tailwind.config.js",
    //   },
    // },
    // {
    //   title: "test 2",
    //   code: `
    //     import tw from "xwind"
    //     const test = tw\`bg-red-200 text-sm\`
    //     const test2 = tw\`bg-red-200 text-sm\`
    //   `,
    //   snapshot: true,
    // },
    // {
    //   title: "test 3",
    //   code: `
    //     import tw from "xwind"
    //     const test = tw\`md:hover:bg-red-200 xl:text-sm\`
    //     const test2 = tw\`bg-red-200 text-sm\`
    //   `,
    //   snapshot: true,
    // },
    // {
    //   title: "test 4",
    //   code: `
    //     import tw from "xwind"
    //     const test = tw\`md:hover:bg-red-200 xl:text-sm\`
    //     const test2 = tw\`bg-red-200 text-sm\`
    //   `,
    //   snapshot: true,
    // },
  ],
});
