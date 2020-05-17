const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");

// const benchBuilder = require("./utils/benchBuilder");
// const test = benchBuilder("tailwind.macro");

const test = require("./utils/tailwind1");

pluginTester.default({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: test,
});
