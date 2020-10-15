//@ts-expect-error
import corePlugins from "tailwindcss/lib/corePlugins";
import {
  mergeObjectStyles,
  ObjectStyle,
  tailwindData,
  transformPostcssRootsToTwObjectMap,
  transformTwRootToObjectStyle,
} from "@tailwindcssinjs/tailwindcss-data";

import { TwClasses, twClassesParser } from "@tailwindcssinjs/class-composer";

//@ts-expect-error
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

function getTwClasses() {
  const out = [...twObjectMap.keys()];
  console.log(out);
  return out;
}

// OUTPUT CSS:
// [
//   'container',   'form-input',    'form-textarea', 'form-multiselect',
//   'form-select', 'form-checkbox', 'form-radio',    'prose',
//   'prose-sm',    'prose-lg',      'prose-xl',      'prose-2xl',
//   'space-y-0',   'space-x-0',     'space-y-1',     'space-x-1',
//   ... 4247 more items
// ]
getTwClasses();

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

function getCSSFromTailwindClasses(...twClasses: TwClasses[]) {
  const parsedTwClasses = twParser(twClasses);

  const roots: string[] = [];
  for (const parsedTwClass of parsedTwClasses) {
    roots.push(
      generateTwClassSubstituteRoot(twObjectMap, parsedTwClass).toString()
    );
  }

  const out = roots.join("\n");
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
