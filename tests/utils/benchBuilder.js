("use strict");
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const tailwindcssConfig_1 = require("@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig");
const corePlugins_1 = __importDefault(require("tailwindcss/lib/corePlugins"));

const tailwindcssData_1 = require("@tailwindcssinjs/tailwindcss-data/lib/tailwindcssData");
const transformers_1 = require("@tailwindcssinjs/transformers");
let twObjectMap;

function getTailwindClasses() {
  // const tailwindConfigPath = tailwindcssConfig_1.resolveTailwindConfigPath(
  //   "./tailwind.config.js"
  // );
  const config = tailwindcssConfig_1.requireTailwindConfig();

  const { componentsRoot, utilitiesRoot } = tailwindcssData_1.tailwindData(
    config,
    corePlugins_1.default
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

function benchBuilder(macroImport1, macroImport2) {
  const padStr = (str) => {
    return str.padEnd(30, " ");
  };
  const tailwindClassesMap = getTailwindClasses();
  const tests = [];
  const classes = [];
  const keys = [];
  for (const [key, styleObject] of tailwindClassesMap.entries()) {
    keys.push(key);
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
    padStr(`1. initial load (just import)`),
    {
      code: `
          import tw from '${macroImport1}';
          `,
      snapshot: true,
    },
    ,
  ]);

  tests.push([
    padStr(`2. initial load (just import)`),
    {
      code: `
          import tw from '${macroImport2}';
          `,
      snapshot: true,
    },
    ,
  ]);

  classes.slice(0, 15).forEach((key) => {
    tests.push([
      padStr(`1. ${key}`),
      {
        code: `
  import tw from '${macroImport1}';
  const css = tw\`${key}\`;
  `,
        snapshot: true,
      },
    ]);
    tests.push([
      padStr(`2. ${key}`),
      {
        code: `
  import tw from '${macroImport2}';
  const css = tw\`${key}\`;
  `,
        snapshot: true,
      },
    ]);
  });

  tests.push([
    padStr(`1. multiple transforms 20 classes`),
    {
      code: `
          import tw from '${macroImport1}';
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
    padStr(`2. multiple transforms 20 classes`),
    {
      code: `
          import tw from '${macroImport2}';
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
    padStr(`1. test ${classes.slice(0, 10).length} classes`),
    {
      code: `
          import tw from '${macroImport1}';
          const css = tw\`${classes.slice(0, 10).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`2. test ${classes.slice(0, 10).length} classes`),
    {
      code: `
          import tw from '${macroImport2}';
          const css = tw\`${classes.slice(0, 10).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`1. test ${classes.slice(0, 20).length} classes`),
    {
      code: `
          import tw from '${macroImport1}';
          const css = tw\`${classes.slice(0, 20).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`2. test ${classes.slice(0, 20).length} classes`),
    {
      code: `
          import tw from '${macroImport2}';
          const css = tw\`${classes.slice(0, 20).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`1. test ${classes.slice(0, 40).length} classes`),
    {
      code: `
          import tw from '${macroImport1}';
          const css = tw\`${classes.slice(0, 40).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`2. test ${classes.slice(0, 40).length} classes`),
    {
      code: `
          import tw from '${macroImport2}';
          const css = tw\`${classes.slice(0, 40).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`1. test ${classes.slice(0, 80).length} classes`),
    {
      code: `
          import tw from '${macroImport1}';
          const css = tw\`${classes.slice(0, 80).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`2. test ${classes.slice(0, 80).length} classes`),
    {
      code: `
          import tw from '${macroImport2}';
          const css = tw\`${classes.slice(0, 80).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`1. test ${classes.slice(0, 160).length} classes`),
    {
      code: `
          import tw from '${macroImport1}';
          const css = tw\`${classes.slice(0, 160).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`2. test ${classes.slice(0, 160).length} classes`),
    {
      code: `
          import tw from '${macroImport2}';
          const css = tw\`${classes.slice(0, 160).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`1. test ${classes.slice(0, 220).length} classes`),
    {
      code: `
          import tw from '${macroImport1}';
          const css = tw\`${classes.slice(0, 220).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  tests.push([
    padStr(`2. test ${classes.slice(0, 220).length} classes`),
    {
      code: `
          import tw from '${macroImport2}';
          const css = tw\`${classes.slice(0, 220).join(" ")}\`;
          `,
      snapshot: true,
    },
  ]);
  // tests.push([
  //   padStr(`1. test all ${keys.length} classes`),
  //   {
  //     code: `
  //         import tw from '${macroImport1}';
  //         const css = tw\`${keys.join(" ")}\`;
  //         `,
  //     snapshot: true,
  //   },
  // ]);
  // tests.push([
  //   padStr(`2. test all ${keys.length} classes`),
  //   {
  //     code: `
  //         import tw from '${macroImport2}';
  //         const css = tw\`${keys.join(" ")}\`;
  //         `,
  //     snapshot: true,
  //   },
  // ]);
  return Object.fromEntries(tests);
}

module.exports = benchBuilder;
