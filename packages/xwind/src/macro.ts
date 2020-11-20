import { createMacro, MacroError, MacroParams } from "babel-plugin-macros";
import { getTwConfigPath } from "./tailwindConfig";
import { getCachedTransformer } from "./transformUtils";

interface XwindMacroParams extends MacroParams {
  config?: {
    config?: string;
  };
}

function xwindMacro({
  references: { default: paths },
  state,
  babel: { types: t },
  config,
}: XwindMacroParams) {
  try {
    const twConfigPath = getTwConfigPath(config?.config);
    const transformer = getCachedTransformer(twConfigPath);
    transformer(paths, state, t);
  } catch (err) {
    err.message = `xwind/macro - ${err.message}`;
    throw new MacroError(err);
  }
}

export default createMacro(xwindMacro, {
  configName: "xwind",
});
