const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");

const benchBuilder = require("./utils/benchBuilder");
const test = benchBuilder("twin.macro");

pluginTester.default({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: test,
});
