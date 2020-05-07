const tailwindcss_data_1 = require("@tailwindcssinjs/tailwindcss-data");
const transformers_1 = require("@tailwindcssinjs/transformers");

function getTailwindClasses() {
  let configPath;

  //check for config
  try {
    configPath = tailwindcss_data_1.resolveTailwindConfigPath();
  } catch (err) {
    configPath = undefined;
  }

  const config = tailwindcss_data_1.resolveTailwindConfig(configPath);
  const { componentsRoot, utilitiesRoot } = tailwindcss_data_1.tailwindData(
    config
  );
  const transformedComponents = transformers_1.transformPostcssRootToTwObjects(
    componentsRoot,
    "component"
  );
  const transformedUtilities = transformers_1.transformPostcssRootToTwObjects(
    utilitiesRoot,
    "utility"
  );
  return transformers_1.transformTwObjectsToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities,
  ]);
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

  classes.slice(0, 30).forEach((key) =>
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
