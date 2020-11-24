# xwind

[![NPM version](https://badgen.net/npm/v/xwind)](https://www.npmjs.com/package/xwind)
[![License](https://badgen.net/npm/license/xwind)](https://www.npmjs.com/package/xwind)
[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

xwind uses a babel plugin that transforms Tailwind classes into CSS object styles or a classes string. The CSS object styles output can be used with your favorite CSS-in-JS library like emotion, styled-components ... The classes string output can be used with the xwind cli to generate a minimal css file of the used Tailwind classes.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

- [Basic examples](#basic-examples)
  - [Output mode "objectstyles" example](#output-mode-objectstyles-example)
  - [Output mode "classes" example](#output-mode-classes-example)
- [objectstyles mode](#objectstyles-mode)
- [classes mode](#classes-mode)
- [API](#api)
- [Install](#install)
  - [0. Prerequisites:](#0-prerequisites)
  - [1. Install packages](#1-install-packages)
  - [2. Add xwind babel plugin to babel config](#2-add-xwind-babel-plugin-to-babel-config)
  - [3. Create Tailwind config file](#3-create-tailwind-config-file)
  - [4. Choose your preferred xwind mode:](#4-choose-your-preferred-xwind-mode)
  - [4.A "objectstyles" mode install instructions](#4a-objectstyles-mode-install-instructions)
    - [4.1 Add xwind config mode option to tailwind.config.js](#41-add-xwind-config-mode-option-to-tailwindconfigjs)
    - [4.2 Add Tailwind base css](#42-add-tailwind-base-css)
    - [4.2.A Using "XWIND_BASE XWIND_GLOBAL" classes](#42a-using-xwind_base-xwind_global-classes)
    - [4.2.B Create a tailwind.base.css file](#42b-create-a-tailwindbasecss-file)
    - [4.2.1 Add the xwind base tailwind plugin to add support for keyframe, ring and shadow classes.](#421-add-the-xwind-base-tailwind-plugin-to-add-support-for-keyframe-ring-and-shadow-classes)
    - [4.2.2 Using Tailwind CLI](#422-using-tailwind-cli)
    - [4.2.3 Import base.css](#423-import-basecss)
  - [4.B "classes" mode install instructions](#4b-classes-mode-install-instructions)
    - [4.1 Add xwind config mode option to tailwind.config.js](#41-add-xwind-config-mode-option-to-tailwindconfigjs-1)
    - [4.2 Create the output css file](#42-create-the-output-css-file)
    - [4.3 Generate the tailwind classes](#43-generate-the-tailwind-classes)
- [Examples](#examples)
  - [objectstyles mode](#objectstyles-mode-1)
  - [classes mode (WIP)](#classes-mode-wip)
- [Customization](#customization)
  - [Babel plugin config options](#babel-plugin-config-options)
  - [xwind config](#xwind-config)
  - [classes mode](#classes-mode-1)
  - [objectstyles mode](#objectstyles-mode-2)
  - [objectstyles plugins](#objectstyles-plugins)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Basic examples

### Output mode "objectstyles" example

```js
import xw from "xwind";
//OR
import xw from "xwind/macro";

const styles = xw`text-red-100 hover:text-green-100 hover:bg-blue-200`;
// OR (with custom array syntax)
const styles = xw`text-red-100 hover[text-green-100 bg-blue-200]`;
```

Transforms by default into Postcss-js / JSS compatible syntax:

```js
const styles = {
  "--text-opacity": "1",
  color: ["#fde8e8", "rgba(253, 232, 232, var(--text-opacity))"],
  "&:hover": {
    "--text-opacity": "1",
    "--bg-opacity": "1",
    color: ["#def7ec", "rgba(222, 247, 236, var(--text-opacity))"],
    backgroundColor: ["#c3ddfd", "rgba(195, 221, 253, var(--bg-opacity))"],
  },
};
```

Transform to CSS string syntax with the css plugin:

```js
const styles = `
  --text-opacity: 1;
  color: #fde8e8;
  color: rgba(253, 232, 232, var(--text-opacity));
  &:hover {
    --text-opacity: 1;
    --bg-opacity: 1;
    color: #def7ec;
    color: rgba(222, 247, 236, var(--text-opacity));
    background-color: #c3ddfd;
    background-color: rgba(195, 221, 253, var(--bg-opacity));
  }
`;
```

objectstyles plugins make it possible to support any CSS-in-JS library syntax.

### Output mode "classes" example

```js
import xw from "xwind";
//OR
import xw from "xwind/macro";

const styles = xw`text-red-100 hover:text-green-100 hover:bg-blue-200`;
// OR (with custom array syntax)
const styles = xw`text-red-100 hover[text-green-100 bg-blue-200]`;
```

Transforms into a classes string:

```js
const styles = "text-red-100 hover:text-green-100 hover:bg-blue-200";
```

Generate the css output with with the xwind cli:

```bash
npx run xwind
```

Output file "/src/styles/xwind.css":

```css
/*! Generated with xwind | https://github.com/arthie/xwind */
.hover\:bg-blue-200:hover {
  --tw-bg-opacity: 1;
  background-color: rgba(191, 219, 254, var(--tw-bg-opacity));
}
.text-red-100 {
  --tw-text-opacity: 1;
  color: rgba(254, 226, 226, var(--tw-text-opacity));
}
.hover\:text-green-100:hover {
  --tw-text-opacity: 1;
  color: rgba(220, 252, 231, var(--tw-text-opacity));
}
```

Import the output file "/src/styles/xwind.css" into your project:

```js
//Javascript:
import "/src/styles/xwind.css";
//OR
//HTML:
<link rel="stylesheet" href="/src/styles/xwind.css" />;
```

## objectstyles mode

In objectstyles mode xwind will transform Tailwind classes into CSS object styles. The CSS object styles output can be used with your favorite CSS-in-JS library like emotion, styled-components.
Objectstyles plugins make it possible to support any CSS-in-JS library syntax.

`note:` objectstyles mode is recommended if you are using a CSS-in-JS library.

## classes mode

In classes mode xwind will transforms Tailwind classes into classes string. The classes string output can be used with the xwind cli to generate a minimal css file of the used Tailwind classes. This allows xwind to be used **without** a CSS-in-JS library.

`note:` classes mode is recommended if you're already using tailwindcss and want the benefits of xwind.

## API

```js
//these import will be removed by the babel plugin in build
import xw from "xwind";
//also available as macro variant
import xw from "xwind/macro";

import xw, { cx } from "xwind"; //or "xwind/macro"

//cx is used to compose different classes
//cx uses the clsx library from lukreed: https://github.com/lukeed/clsx#readme
cx(xw`text-green-200`, true && xw`bg-red-500`);

//tagged template syntax
xw`bg-red-100 bg-blue-400`;

//call expression syntax
xw("bg-red-100 bg-blue-400");
xw("bg-red-100", "bg-blue-400", [["text-sm"], "font-sans"]);

//xwind can evaluate static expressions
xw`bg-red-100 ${"bg-red-100"}`;

const bg = "bg-red-100";

xw`bg-red-100 ${bg}`;

xw("bg-red-100", bg);
```

## Install

### 0. Prerequisites:

- Have node 12 or above installed
- Install and configure your bundler with [babel](https://github.com/babel/babel) ([babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros) is optional)

### 1. Install packages

```bash
# with npm
npm install -D xwind tailwindcss postcss autoprefixer

# with Yarn
yarn add -D xwind tailwindcss postcss autoprefixer
```

`note` autoprefixer is optional tailwindcss has it as peerdependency but it's not needed for xwind.

### 2. Add xwind babel plugin to babel config

This step is optional if you plan on using the "xwind/macro" instead.

```js
// .babelrc
{
  "presets": [
    //... presets
  ],
  "plugins": [
    //add this:
    "xwind/babel"
  ]
}
```

### 3. Create Tailwind config file

The tailwind.config.js file is required to configure xwind config options.

```bash
npx tailwindcss init
```

Check out the [Tailwind documentation](https://tailwindcss.com/docs/configuration) for customizing the Tailwind config file.

### 4. Choose your preferred xwind mode:

### 4.A "objectstyles" mode install instructions

#### 4.1 Add xwind config mode option to tailwind.config.js

```js
// tailwind.config.js
module.exports = {
  theme: {},
  plugins: [],
  // ... tailwind config options

  //Add this:
  xwind: {
    mode: "objectstyles",
  },
};
```

#### 4.2 Add Tailwind base css

#### 4.2.A Using "XWIND_BASE XWIND_GLOBAL" classes

You can add the Tailwind base styling and classes global styling with the special xwind classes:

- `XWIND_BASE` adds Tailwind base styling
- `XWIND_GLOBAL` adds global classes styling e.g. keyframes and ring / shadow css variables

example with emotion

```jsx
import { Global } from "@emotion/react";
import xw from "xwind";

<Global
  //add tailwind base + keyframes ... to global styles
  styles={xw`XWIND_BASE XWIND_GLOBAL`}
/>;
```

<details>
  <summary>Generate base CSS with Tailwind cli</summary>

#### 4.2.B Create a tailwind.base.css file

```css
/* tailwind.base.css */
@tailwind base;
```

#### 4.2.1 Add the xwind base tailwind plugin to add support for keyframe, ring and shadow classes.

```js
// tailwind.config.js
module.exports = {
  theme: {},
  // ... tailwind config options

  //Add this:
  plugins: [require("xwind/plugins/base")],

  xwind: {
    mode: "objectstyles",
  },
};
```

#### 4.2.2 Using Tailwind CLI

```bash
# Use the `npx tailwindcss help build` command to learn more about the various CLI options.
npx tailwindcss build tailwind.base.css -o base.css
```

**Tip:** add this command to your package.json scripts section

#### 4.2.3 Import base.css

```js
import "base.css";
```

</details>

### 4.B "classes" mode install instructions

#### 4.1 Add xwind config mode option to tailwind.config.js

```js
// tailwind.config.js
module.exports = {
  theme: {},
  plugins: [],
  // ... tailwind config options

  //Add this:
  xwind: {
    mode: "classes",
    classes: {
      //entry files location all files containing xwind imports
      entry: "./src", // string | string[] / required
      //output css file location
      output: "./styles/xwind.css", //string / required
    },
  },
};
```

#### 4.2 Create the output css file

Create a new css file at the location specified in the xwind config output option.

#### 4.3 Generate the tailwind classes

Run the xwind cli to generate a minimal css file of the used Tailwind classes.

```bash
# Use the `npx xwind --help` command to learn more about the various CLI options.
npx xwind

# Run the xwind cli in watch mode, file changes will trigger rebuilds.
npx xwind -w
```

**Tip:** add this command to your package.json scripts section

## Examples

### objectstyles mode

[Codesandbox](https://codesandbox.io/s/tailwindcssinjsmacro-simple-example-nzyu8?file=/pages/index.tsx) with Typescript, [Nextjs](https://nextjs.org/) and [Emotion](https://emotion.sh/docs/introduction)

[Official Next.js example - Tailwind CSS with Emotion.js](https://github.com/zeit/next.js/tree/canary/examples/with-tailwindcss-emotion)

### classes mode (WIP)

coming soon!

## Customization

### Babel plugin config options

```jsonc
// .babelrc
{
  "presets": [
    /* ...presets */
  ],
  "plugins": [
    [
      "xwind/babel",
      {
        "config": "./tailwind.config.js" //Path to tailwind config default: 'tailwind.config.js'
      }
    ]
    /* ...other plugins */
  ]
}
```

<details>
  <summary>Babel macro plugin configuration</summary>

```jsonc
// .babelrc
{
  "presets": [
    /* ...presets */
  ],
  "plugins": [
    [
      "macros",
      {
        "xwind": {
          "config": "./tailwind.config.js" //Path to 'tailwind.config.js'
        }
      }
    ]
    /* ...other plugins */
  ]
}
```

```jsonc
// package.json
"babelMacros": {
    "xwind": {
      "config": "./tailwind.config.js",  //Path to 'tailwind.config.js'
    }
},
```

```js
// babel-plugin-macros.config.js
module.exports = {
  xwind: {
    config: "./tailwind.config.js", //Path to 'tailwind.config.js'
  },
};
```

</details>

### xwind config

The xwind config options are set in the `tailwind.config.js` file

### classes mode

```js
// tailwind.config.js
module.exports = {
  theme: {},
  plugins: [],
  // ... tailwind config options

  xwind: {
    //select xwind output mode
    mode: "classes", // "classes" / required
    classes: {
      //include tailwindcss base styles
      includeBase: true, // boolean / optional / default: true
      //entry files location all files containing xwind imports
      entry: "./src", // string | string[] / required
      //output css file location
      output: "./styles/xwind.css", //string / required
    },
  },
};
```

### objectstyles mode

```js
// tailwind.config.js
module.exports = {
  theme: {},
  plugins: [],
  // ... tailwind config options

  xwind: {
    //select xwind output mode
    mode: "objectstyles", // "objectstyles" / required
    objectstyles: {
      //enable babel cache warning
      warningCache: true, // boolean / optional / default: true,
      plugins: [
        /* objectstyles plugins / optional */
      ],
    },
  },
};
```

### objectstyles plugins

To support the different CSS-in-JS syntaxes we need a way to change the default output this can be done with xwind objectstyles plugins.

**CSS string**

```js
// tailwind.config.js
module.exports = {
  //... tailwind config options
  xwind: {
    mode: "objectstyles",
    objectstyles: {
      plugins: [require("xwind/plugins/objectstyles/css")],
    },
  },
};
```

<details>
  <summary>CSS string plugin output example</summary>

Default

```js
const styles = {
  "--text-opacity": "1",
  color: ["#fde8e8", "rgba(253, 232, 232, var(--text-opacity))"],
  "&:hover": {
    "--text-opacity": "1",
    "--bg-opacity": "1",
    color: ["#def7ec", "rgba(222, 247, 236, var(--text-opacity))"],
    backgroundColor: ["#c3ddfd", "rgba(195, 221, 253, var(--bg-opacity))"],
  },
};
```

With CSS string plugin

```js
const styles = `
  --text-opacity: 1;
  color: #fde8e8;
  color: rgba(253, 232, 232, var(--text-opacity));
  &:hover {
    --text-opacity: 1;
    --bg-opacity: 1;
    color: #def7ec;
    color: rgba(222, 247, 236, var(--text-opacity));
    background-color: #c3ddfd;
    background-color: rgba(195, 221, 253, var(--bg-opacity));
  }
`;
```

</details>

**Remove fallbacks**

```js
// tailwind.config.js
module.exports = {
  //... tailwind config options
  xwind: {
    mode: "objectstyles",
    objectstyles: {
      plugins: [require("xwind/plugins/objectstyles/removeFallbacks")],
    },
  },
};
```

<details>
  <summary>Remove fallbacks plugin output example</summary>
Default

```js
const styles = {
  "--text-opacity": "1",
  color: ["#fde8e8", "rgba(253, 232, 232, var(--text-opacity))"],
  "&:hover": {
    "--text-opacity": "1",
    "--bg-opacity": "1",
    color: ["#def7ec", "rgba(222, 247, 236, var(--text-opacity))"],
    backgroundColor: ["#c3ddfd", "rgba(195, 221, 253, var(--bg-opacity))"],
  },
};
```

With remove fallbacks plugin

```js
const styles = {
  "--text-opacity": "1",
  color: "rgba(253, 232, 232, var(--text-opacity))",
  "&:hover": {
    "--text-opacity": "1",
    "--bg-opacity": "1",
    color: "rgba(222, 247, 236, var(--text-opacity))",
    backgroundColor: "rgba(195, 221, 253, var(--bg-opacity))",
  },
};
```

</details>

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.
