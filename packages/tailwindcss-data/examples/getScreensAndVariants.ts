import corePlugins from "tailwindcss/lib/corePlugins";
import { tailwindData } from "@tailwindcssinjs/tailwindcss-data";

import config from "../../../tailwind.config.js";

const {
  baseRoot,
  componentsRoot,
  utilitiesRoot,
  generateTwClassSubstituteRoot,
  screens,
  variants,
  resolvedConfig,
} = tailwindData(config, corePlugins);

console.log(screens, variants);
