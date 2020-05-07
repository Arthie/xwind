const tailwindcss_data_1 = require("@tailwindcssinjs/tailwindcss-data");
const transformers_1 = require("@tailwindcssinjs/transformers");

let tailwind;
let configPath;

const tailwindcssInJs = (macroImport) => {
  //check for config
  try {
    configPath = tailwindcss_data_1.resolveTailwindConfigPath();
  } catch (err) {
    configPath = undefined;
  }

  if (!tailwind) {
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
    const tsStyleObjectMap = transformers_1.transformTwObjectsToTwStyleObjectMap(
      [...transformedComponents, ...transformedUtilities]
    );

    const tests = [];
    const classes = [];
    tests.push([
      `initial load (no usage)`,
      {
        code: `
          import tw from '${macroImport}';
          `,
        snapshot: true,
      },
      ,
    ]);
    for (const [key, styleObject] of tsStyleObjectMap.entries()) {
      if (
        key.includes("text") &&
        !key.includes("opacity") &&
        styleObject.type === "utility"
      ) {
        classes.push(key, `md:hover:${key}`);
        tests.push([
          `${key} =`,
          {
            code: `
      import tw from '${macroImport}';
      const css = tw\`${key}\`;
      `,
            snapshot: true,
          },
        ]);
        tests.push([
          `md:hover:${key} =`,
          {
            code: `
              import tw from '${macroImport}';
              const css = tw\`md:hover:${key}\`;
              `,
            snapshot: true,
          },
        ]);
      }
    }
    tests.push([
      `test ${classes.slice(0, 10).length} classes =`,
      {
        code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 10).join(" ")}\`;
          `,
        snapshot: true,
      },
    ]);
    tests.push([
      `test ${classes.slice(0, 20).length} classes =`,
      {
        code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 20).join(" ")}\`;
          `,
        snapshot: true,
      },
    ]);
    tests.push([
      `test ${classes.slice(0, 40).length} classes =`,
      {
        code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 40).join(" ")}\`;
          `,
        snapshot: true,
      },
    ]);
    tests.push([
      `test ${classes.slice(0, 80).length} classes =`,
      {
        code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 80).join(" ")}\`;
          `,
        snapshot: true,
      },
    ]);
    tests.push([
      `test ${classes.slice(0, 160).length} classes =`,
      {
        code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 160).join(" ")}\`;
          `,
        snapshot: true,
      },
    ]);
    tests.push([
      `test ${classes.slice(0, 220).length} classes =`,
      {
        code: `
          import tw from '${macroImport}';
          const css = tw\`${classes.slice(0, 220).join(" ")}\`;
          `,
        snapshot: true,
      },
    ]);
    tailwind = Object.fromEntries(tests);
  }
  return tailwind;
};

function benchBuilder(macroImport) {
  return tailwindcssInJs(macroImport);
}

module.exports = benchBuilder;
