import corePlugins from "tailwindcss/lib/corePlugins";
import {
  tailwindData,
  transformPostcssRootsToTwObjectMap,
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

function getCSSFromTailwindClass(parsedClass: [string, string[]]) {
  const out = generateTwClassSubstituteRoot(
    twObjectMap,
    parsedClass
  ).toString();
  console.log(out);
  return out;
}

// OUTPUT CSS:
// @media (min-width: 1024px) {
//   .hover\:bg-red-300:hover {
//       --bg-opacity: 1;
//       background-color: #f8b4b4;
//       background-color: rgba(248, 180, 180, var(--bg-opacity))
//   }
// }
getCSSFromTailwindClass(["bg-red-300", ["hover", "md"]]);

// OUTPUT CSS:
// .hover\:bg-red-300:hover {
//     --bg-opacity: 1;
//     background-color: #f8b4b4;
//     background-color: rgba(248, 180, 180, var(--bg-opacity))
// }
getCSSFromTailwindClass(["bg-red-300", ["hover"]]);

// OUTPUT CSS:
// .bg-red-300 {
//   --bg-opacity: 1;
//   background-color: #f8b4b4;
//   background-color: rgba(248, 180, 180, var(--bg-opacity))
// }
getCSSFromTailwindClass(["bg-red-300", []]);
