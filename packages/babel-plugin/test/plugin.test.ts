import pluginTester from "babel-plugin-tester";

import plugin from "../lib/plugin";

pluginTester({
  plugin,
  pluginName: "tailwindcssinjs",
  pluginOptions: {
    output: "./test.css",
  },
  tests: [
    {
      title: "remove import",
      code: 'import tw from "tailwindcssinjs"',
      output: "",
    },
    {
      title: "other import",
      code: 'import { cx } from "tailwindcssinjs";',
      output: 'import { cx } from "tailwindcssinjs";',
    },
    {
      title: "other import2",
      code: `
        import tailwind from "tailwindcssinjs"
        const test = tailwind\`bg-red-200\`
      `,
      output: 'const test = "bg-red-200";',
    },
    {
      title: "test 1",
      code: `
        import tw from "tailwindcssinjs"
        const test = tw\`bg-red-200\`
      `,
      output: 'const test = "bg-red-200";',
    },
    {
      title: "test 2",
      code: `
        import tw from "tailwindcssinjs"
        const test = tw\`bg-red-200 text-sm\`
        const test2 = tw\`bg-red-200 text-sm\`
      `,
      snapshot: true,
    },
  ],
});
