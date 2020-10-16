//@ts-nocheck
import corePlugins from "tailwindcss/lib/corePlugins";
import {
  createTwClassDictionary,
  tailwindData,
} from "@tailwindcssinjs/tailwindcss-data";

import { TwClasses, twClassesParser } from "@tailwindcssinjs/class-composer";
import config from "../../../tailwind.config.js";
import { root } from "postcss";

const {
  resolvedConfig,
  generateTwClassSubstituteRoot,
  utilitiesRoot,
  componentsRoot,
} = tailwindData(config, corePlugins);

const twParser = twClassesParser(resolvedConfig.separator);

const twClassDictionary = createTwClassDictionary(
  componentsRoot,
  utilitiesRoot
);

function getCSSFromTailwindClasses(...twClasses: TwClasses[]) {
  const parsedTwClasses = twParser(twClasses);

  const combinedRoot = root();
  for (const parsedTwClass of parsedTwClasses) {
    const twRoot = generateTwClassSubstituteRoot(
      twClassDictionary,
      parsedTwClass
    );
    combinedRoot.append(twRoot);
  }
  const out = combinedRoot.toString();
  console.log(out);
  return out;
}

// OUTPUT CSS:
// .bg-red-300 {
//   --bg-opacity: 1;
//   background-color: #f8b4b4;
//   background-color: rgba(248, 180, 180, var(--bg-opacity))
// }
// @media (min-width: 1024px) {
//   .hover\:bg-red-300:hover {
//       --bg-opacity: 1;
//       background-color: #f8b4b4;
//       background-color: rgba(248, 180, 180, var(--bg-opacity))
//   }
// }
getCSSFromTailwindClasses("bg-red-300 md:hover:bg-red-300");
