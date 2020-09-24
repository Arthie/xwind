import pluginTester from "babel-plugin-tester";
import plugin from "babel-plugin-macros";

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: {
    "no usage": `import tw from '../lib/macro'`,
    "correct usage 1": `
      import tw from '../lib/macro';
      const css = tw("dark:bg-black bg-gradient-to-r sm:motion-reduce:translate-y-0 motion-reduce:hover:translate-y-0 md:motion-reduce:hover:translate-y-0");
    `,
    "correct usage 5": `
    import tw from '../lib/macro';
    const css = tw("group-hover:bg-red-300");
    `,
    "correct usage 6": `
    import tw from '../lib/macro';
    const css = tw("dark:bg-red-300");
    `,
  },
});
