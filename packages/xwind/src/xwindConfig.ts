import { ObjectStyle, ResolvedTailwindConfig } from "@xwind/core";

interface ClassesModeOptions {
  mode: "classes";
  classes: {
    addBase?: boolean;
    entry: string | string[];
    output: string;
  };
}

interface ObjectstylesModeOptions {
  mode: "objectstyles";
  objectstyles?: {
    developmentMode?: boolean;
    plugins?: Array<
      (
        objectStyle: ObjectStyle,
        composedTwClasses: string[],
        resolvedConfig: ResolvedTailwindConfig
      ) => {}
    >;
  };
}

export type XwindConfigOptions = ClassesModeOptions | ObjectstylesModeOptions;

export interface ResolvedXwindTailwindConfig extends ResolvedTailwindConfig {
  xwind?: XwindConfigOptions;
}

//TODO: add type checking
export function resolveXwindConfig(
  configPath: string,
  config: ResolvedXwindTailwindConfig
): XwindConfigOptions {
  if (!config.xwind) {
    throw new Error(`
    XWIND: No xwind config object found.
    Please add an xwind config object to the "${configPath}" file.
      
      Example:
      //tailwind.config.js
      module.exports = {
        // ... tailwind config options
        xwind: {
          // ... xwind config options
        }
      }
    `);
  }

  const { mode } = config.xwind as Partial<XwindConfigOptions>;

  if (!mode) {
    throw new Error(`
    XWIND: No mode option found in xwind config.
    Please add a mode option to the xwind config object in the "${configPath}" file.
      
      
      Example:
      //tailwind.config.js
      module.exports = {
        // ... tailwind config options
        xwind: {
          mode: "XWIND_MODE" // xwind modes: "classes" or "objectstyles"
          // ... xwind config options
        }
      }
    `);
  }

  if (mode !== "classes" && mode !== "objectstyles")
    console.log(`
    XWIND: Mode has been set to "${mode}".
    Please change the mode option from the xwind config object in the "${configPath}" file to "classes" or "objectstyles".
    
      Example:
      //tailwind.config.js
      module.exports = {
        // ... tailwind config options
        xwind: {
          mode: "classes" //or "objectstyles"
          // ... xwind config options
        }
      }
    `);

  if (config.xwind.mode === "classes") {
    if (!config.xwind.classes) {
      throw new Error(`XWIND:"No classes option found in xwind options"`);
    }

    const { addBase, entry, output } = config.xwind.classes;

    if (!entry) {
      throw new Error(`
      XWIND: No entry option found in xwind config classes property.
      Please add a entry option to the classes property from the xwind config object in the "${configPath}" file.

        Example:
        //tailwind.config.js
        module.exports = {
          // ... tailwind config options
          xwind: {
            mode: "classes",
            classes: {
              entry: "./src" //string or string[]
              // ... xwind classes options
            }
            // ... xwind options
          }
        }
      `);
    }

    if (!output) {
      throw new Error(`
      XWIND: No output option found in xwind config classes property.
      Please add a output option to the classes property from the xwind config object in the "${configPath}" file.
        Example:
        //tailwind.config.js
        module.exports = {
          // ... tailwind config options
          xwind: {
            mode: "classes",
            classes: {
              output: "./src/styles/xwind.css"
              // ... xwind classes options
            }
            // ... xwind options
          }
        }
      `);
    }
  }

  return config.xwind;
}

export function resolveXwindClassesModeConfig(
  configPath: string,
  config: ResolvedXwindTailwindConfig
): ClassesModeOptions {
  const xwindConfig = resolveXwindConfig(configPath, config);
  if (xwindConfig.mode !== "classes") {
    throw new Error(`
    XWIND: Mode has been set to "${xwindConfig.mode}".
    Please change the mode option from the xwind config object in the "${configPath}" file to "classes"
    
      Example:
      //tailwind.config.js
      module.exports = {
        // ... tailwind config options
        xwind: {
          mode: "classes"
          // ... xwind config options
        }
      }
    `);
  }
  return xwindConfig;
}

export function resolveXwindObjectstylesModeConfig(
  configPath: string,
  config: ResolvedXwindTailwindConfig
): ObjectstylesModeOptions {
  const xwindConfig = resolveXwindConfig(configPath, config);
  if (xwindConfig.mode !== "objectstyles") {
    throw new Error(
      `XWIND: Mode has been set to "${xwindConfig.mode}". Please change the mode option from the xwind config object in the "${configPath}" file to "objectstyles"`
    );
  }
  return xwindConfig;
}

export function getMode(
  config: ResolvedXwindTailwindConfig
): "classes" | "objectstyles" {
  if (config.xwind && config.xwind.mode === "classes") {
    return "classes";
  }
  return "objectstyles";
}
