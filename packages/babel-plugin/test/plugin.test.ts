import pluginTester from "babel-plugin-tester";

import plugin from "../lib/plugin";

pluginTester({
  plugin,
  pluginName: "tailwindcssinjs",
  pluginOptions: {
    cache: false,
    includeBase: true,
    output: "./test.css",
  },
  tests: [
    {
      title: "remove import",
      code: 'import tw from "@tailwindcssinjs/css"',
      output: "",
    },
    {
      title: "other import",
      code: 'import { cx } from "@tailwindcssinjs/css";',
      output: 'import { cx } from "@tailwindcssinjs/css";',
    },
    {
      title: "other import2",
      code: `
        import tailwind from "@tailwindcssinjs/css"
        const test = tailwind\`bg-red-200\`
      `,
      output: 'const test = "bg-red-200";',
    },
    {
      title: "test 1",
      code: `
        import tw from "@tailwindcssinjs/css"
        const test = tw\`bg-red-500\`
      `,
      snapshot: true,
      // @ts-expect-error
      pluginOptions: {
        cssPath: "../test.css",
      },
    },
    {
      title: "test 2",
      code: `
        import tw from "@tailwindcssinjs/css"
        const test = tw\`bg-red-200 text-sm\`
        const test2 = tw\`bg-red-200 text-sm\`
      `,
      snapshot: true,
    },
    {
      title: "test 3",
      code: `
        import tw from "@tailwindcssinjs/css"
        const test = tw\`md:hover:bg-red-200 xl:text-sm\`
        const test2 = tw\`bg-red-200 text-sm\`
      `,
      snapshot: true,
    },
    {
      title: "test 4",
      code: `
        import tw from "@tailwindcssinjs/css"
        const test = tw\`md:hover:bg-red-200 xl:text-sm\`
        const test2 = tw\`bg-red-200 text-sm\`
      `,
      snapshot: true,
    },
  ],
});
