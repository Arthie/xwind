# @xwind/core

[![NPM version](https://badgen.net/npm/v/@xwind/core)](https://www.npmjs.com/package/@xwind/core)
[![License](https://badgen.net/npm/license/@xwind/core)](https://www.npmjs.com/package/@xwind/core)

The @xwind/core package uses Tailwind internals to extracts/generate all the data you could want from Tailwind. It provides the data in a structured way with the necessary utilities to create and manipulate this data.

In short: **Unofficial Tailwind developer API**

## More info coming soon!

### This package is under development breaking changes possible!

## Install

```bash
# with npm
npm install @xwind/core @xwind/class-utilities tailwindcss

# with Yarn
yarn add @xwind/core @xwind/class-utilities tailwindcss
```

## Examples

<details>
  <summary>
    List all Tailwind Classes
  </summary>

```typescript
import { tailwindData, createTwClassDictionary } from "@xwind/core";

import config from "../../../tailwind.config.js";

const { utilitiesRoot, componentsRoot } = tailwindData(config);

const twClassDictionary = createTwClassDictionary(
  componentsRoot,
  utilitiesRoot
);

function getTwClasses() {
  const out = Object.keys(twClassDictionary);
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
```

</details>

<details>
  <summary>
    Get CSS from Tailwind class
  </summary>

```typescript
import { tailwindData, createTwClassDictionary } from "@xwind/core";

import config from "../../../tailwind.config.js";

const {
  generateTwClassSubstituteRoot,
  utilitiesRoot,
  componentsRoot,
} = tailwindData(config);

const twClassDictionary = createTwClassDictionary(
  componentsRoot,
  utilitiesRoot
);

function getCSSFromTailwindClass(parsedClass: [string, string[]]) {
  const out = generateTwClassSubstituteRoot(
    twClassDictionary,
    parsedClass
  ).toString();
  console.log(out);
  return out;
}

// OUTPUT CSS:
// @media (min-width: 1024px) {
//   .md\:hover\:bg-red-300:hover {
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
```

</details>

<details>
  <summary>
    Get CSS from Tailwind classes
  </summary>

```typescript
import { createTwClassDictionary, tailwindData } from "@xwind/core";

import { TwClasses, twClassesParser } from "@xwind/class-utilities";
import config from "../../../tailwind.config.js";
import { root } from "postcss";

const {
  resolvedConfig,
  generateTwClassSubstituteRoot,
  utilitiesRoot,
  componentsRoot,
} = tailwindData(config);

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
//     --bg-opacity: 1;
//     background-color: #f8b4b4;
//     background-color: rgba(248, 180, 180, var(--bg-opacity))
// }
// @media (min-width: 1024px) {
//     .md\:hover\:bg-red-300:hover {
//         --bg-opacity: 1;
//         background-color: #f8b4b4;
//         background-color: rgba(248, 180, 180, var(--bg-opacity))
//     }
// }
getCSSFromTailwindClasses("bg-red-300 md:hover:bg-red-300");
```

</details>

<details>
  <summary>
    Get CSS object style from Tailwind class
  </summary>

```typescript
import {
  createTwClassDictionary,
  tailwindData,
  transformTwRootToObjectStyle,
} from "@xwind/core";

import config from "../../../tailwind.config.js";

const {
  generateTwClassSubstituteRoot,
  utilitiesRoot,
  componentsRoot,
} = tailwindData(config);

const twClassDictionary = createTwClassDictionary(
  componentsRoot,
  utilitiesRoot
);

function getObjectStyleFromTailwindClass(parsedClass: [string, string[]]) {
  const twRoot = generateTwClassSubstituteRoot(twClassDictionary, parsedClass);
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
```

</details>

<details>
  <summary>
    Get CSS object style from Tailwind classes
  </summary>

```typescript
import {
  createTwClassDictionary,
  mergeObjectStyles,
  ObjectStyle,
  tailwindData,
  transformTwRootToObjectStyle,
} from "@xwind/core";

import { TwClasses, twClassesParser } from "@xwind/class-utilities";

import config from "../../../tailwind.config.js";

const {
  resolvedConfig,
  generateTwClassSubstituteRoot,
  utilitiesRoot,
  componentsRoot,
} = tailwindData(config);

const twParser = twClassesParser(resolvedConfig.separator);

const twClassDictionary = createTwClassDictionary(
  componentsRoot,
  utilitiesRoot
);

function getObjectStyleFromTailwindClasses(...twClasses: TwClasses[]) {
  const parsedTwClasses = twParser(twClasses);

  const objectStyles: ObjectStyle[] = [];
  for (const parsedTwClass of parsedTwClasses) {
    const twRoot = generateTwClassSubstituteRoot(
      twClassDictionary,
      parsedTwClass
    );
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
```

</details>

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.
