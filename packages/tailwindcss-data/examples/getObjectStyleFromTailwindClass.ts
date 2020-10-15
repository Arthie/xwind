import corePlugins from "tailwindcss/lib/corePlugins";
import {
  tailwindData,
  transformPostcssRootsToTwObjectMap,
  transformTwRootToObjectStyle,
} from "@tailwindcssinjs/tailwindcss-data";

import config from "../../../tailwind.config.js";

const {
  generateTwClassSubstituteRoot,
  utilitiesRoot,
  componentsRoot,
} = tailwindData(config, corePlugins);

const twObjectMap = transformPostcssRootsToTwObjectMap([
  componentsRoot,
  utilitiesRoot,
]);

function getObjectStyleFromTailwindClass(parsedClass: [string, string[]]) {
  const twRoot = generateTwClassSubstituteRoot(twObjectMap, parsedClass);
  const out = transformTwRootToObjectStyle(parsedClass[0], twRoot);
  console.log(JSON.stringify(out, null, 4));
  return out;
}

// OUTPUT OBJECT:
// {
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
getObjectStyleFromTailwindClass(["bg-red-300", ["hover", "md"]]);

// OUTPUT OBJECT:
// {
//   "&:hover": {
//       "--bg-opacity": "1",
//       "backgroundColor": [
//           "#f8b4b4",
//           "rgba(248, 180, 180, var(--bg-opacity))"
//       ]
//   }
// }
getObjectStyleFromTailwindClass(["bg-red-300", ["hover"]]);

// OUTPUT OBJECT:
// {
//   "--bg-opacity": "1",
//   "backgroundColor": [
//       "#f8b4b4",
//       "rgba(248, 180, 180, var(--bg-opacity))"
//   ]
// }
getObjectStyleFromTailwindClass(["bg-red-300", []]);
