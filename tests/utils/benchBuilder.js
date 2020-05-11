("use strict");
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const tailwindcssConfig_1 = require("@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig");
const corePlugins_1 = __importDefault(require("tailwindcss/lib/corePlugins"));

const resolveConfig_1 = __importDefault(require("tailwindcss/resolveConfig"));
const tailwindcssData_1 = require("@tailwindcssinjs/tailwindcss-data/lib/tailwindcssData");
const transformers_1 = require("@tailwindcssinjs/transformers");
let twObjectMap;

function getTailwindClasses() {
  // const tailwindConfigPath = tailwindcssConfig_1.resolveTailwindConfigPath(
  //   "./tailwind.config.js"
  // );
  const config = tailwindcssConfig_1.requireTailwindConfig();

  const resolvedConfig = resolveConfig_1.default(config);

  const { componentsRoot, utilitiesRoot } = tailwindcssData_1.tailwindData(
    resolvedConfig,
    corePlugins_1.default(resolvedConfig)
  );
  const componentRules = transformers_1.transformPostcssRootToPostcssRules(
    componentsRoot
  );
  const utilityRules = transformers_1.transformPostcssRootToPostcssRules(
    utilitiesRoot
  );
  twObjectMap = transformers_1.transformPostcssRulesToTwObjectMap(
    utilityRules,
    componentRules
  );

  return twObjectMap;
}

function benchBuilder(macroImport) {
  const padStr = (str) => {
    return str.padEnd(30, " ");
  };
  const tailwindClassesMap = getTailwindClasses();
  const tests = [];
  const classes = [];

  for (const [key, styleObject] of tailwindClassesMap.entries()) {
    //select only utility classes that have text and not opacity in the key
    if (
      key.includes("text") &&
      !key.includes("opacity") &&
      styleObject.type === "utility"
    ) {
      classes.push(key, `md:hover:${key}`);
    }
  }

  tests.push([
    padStr(`initial load (just import)`),
    {
      code: `
          import tw from '${macroImport}';
          `,
      snapshot: true,
    },
    ,
  ]);

  classes.slice(0, 15).forEach((key) =>
    tests.push([
      padStr(`${key}`),
      {
        code: `
  import tw from '${macroImport}';
  const css = tw\`${key}\`;
  `,
        snapshot: true,
      },
    ])
  );
  tests.push([
    padStr(`multiple transforms 20 classes`),
    {
      code: `
          import tw from '${macroImport}';
          const css1 = tw\`${classes.slice(0, 20).join(" ")}\`;
          const css2 = tw\`${classes.slice(5, 25).join(" ")}\`;
          const css3 = tw\`${classes.slice(10, 30).join(" ")}\`;
          const css4 = tw\`${classes.slice(15, 35).join(" ")}\`;
          const css5 = tw\`${classes.slice(20, 40).join(" ")}\`;
          const css6 = tw\`${classes.slice(25, 45).join(" ")}\`;
          const css7 = tw\`${classes.slice(30, 50).join(" ")}\`;
          const css8 = tw\`${classes.slice(35, 55).join(" ")}\`;
          const css9 = tw\`${classes.slice(40, 60).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`test ${classes.slice(0, 10).length} classes`),
    {
      code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 10).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`test ${classes.slice(0, 20).length} classes`),
    {
      code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 20).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`test ${classes.slice(0, 40).length} classes`),
    {
      code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 40).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`test ${classes.slice(0, 80).length} classes`),
    {
      code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 80).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`test ${classes.slice(0, 160).length} classes`),
    {
      code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 160).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`test ${classes.slice(0, 220).length} classes`),
    {
      code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 220).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);

  return Object.fromEntries(tests);
}

module.exports = benchBuilder;
