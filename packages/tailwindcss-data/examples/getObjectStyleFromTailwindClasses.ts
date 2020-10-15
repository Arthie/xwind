import corePlugins from "tailwindcss/lib/corePlugins";
import {
  mergeObjectStyles,
  ObjectStyle,
  tailwindData,
  transformPostcssRootsToTwObjectMap,
  transformTwRootToObjectStyle,
} from "@tailwindcssinjs/tailwindcss-data";

import { TwClasses, twClassesParser } from "@tailwindcssinjs/class-composer";

import config from "../../../tailwind.config.js";

const {
  resolvedConfig,
  generateTwClassSubstituteRoot,
  utilitiesRoot,
  componentsRoot,
} = tailwindData(config, corePlugins);

const twParser = twClassesParser(resolvedConfig.separator);

const twObjectMap = transformPostcssRootsToTwObjectMap([
  componentsRoot,
  utilitiesRoot,
]);

function getObjectStyleFromTailwindClasses(...twClasses: TwClasses[]) {
  const parsedTwClasses = twParser(twClasses);

  const objectStyles: ObjectStyle[] = [];
  for (const parsedTwClass of parsedTwClasses) {
    const twRoot = generateTwClassSubstituteRoot(twObjectMap, parsedTwClass);
    objectStyles.push(transformTwRootToObjectStyle(parsedTwClass[0], twRoot));
  }

  const out = mergeObjectStyles(objectStyles);
  console.log(JSON.stringify(out, null, 4));
  return out;
}

// OUTPUT OBJECT:
// {
//   "--bg-opacity": "1",
//   "backgroundColor": [
//       "#f8b4b4",
//       "rgba(248, 180, 180, var(--bg-opacity))"
//   ],
//   "@media (min-width: 1024px)": {
//       "&:hover": {
//           "--bg-opacity": "1",
//           "backgroundColor": [
//               "#f8b4b4",
//               "rgba(248, 180, 180, var(--bg-opacity))"
//           ]
//       }
//   }
// }
getObjectStyleFromTailwindClasses("bg-red-300 md:hover:bg-red-300");
