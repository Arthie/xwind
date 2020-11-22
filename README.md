<p align="center">
  <img src="https://github.com/Arthie/tailwindcssinjs/raw/xwind/resources/header.png" alt="tailwindcssinjs">
</p>

This repo contains a collection of packages that makes the integration of Tailwind with CSS-in-JS libraries easier.

## Why does this exist?

You may have encountered some of these problems when using Tailwind with CSS-in-JS libraries.

- You have to use PurgeCSS to get the minimal CSS file, PurgeCSS relies on string matching
- No warnings when misspelling, refactoring or using a class that doesn't exist
- Inline classes can get very long and hard to read
- You have to specify the variants for utility classes in tailwind.config.js

## Features / Goals

- Solve all of the above problems
- Automatically compatible with latest Tailwind version **2.X.X**
- New syntax to apply variants to multiple utility classes `md:hover[text-xs font-normal]`
- Reacts to changes in made in `tailwind.config.js`
- Great developer experience with [VS Code extension](https://github.com/Arthie/vscode-xwind) or [typescript-xwind-plugin](https://github.com/Arthie/tailwindcssinjs/tree/xwind/packages/typescript-plugin)
- No runtime impact all transformations happen during build time
- Plugins to support any/your favorite CSS-in-JS syntax

### Support for all Tailwind features:

- All utility and component classes
- All variant utility classes enabled
- Full support for custom classes and `tailwind.config.js` customization
- Supports Tailwind plugins (@tailwindcss/typography, @tailwindcss/forms, ...)

## Packages

### [xwind](https://github.com/Arthie/tailwindcssinjs/tree/xwind/packages/xwind)

xwind is a babel plugin that transforms Tailwind classes into CSS object styles or a classes string. The CSS object styles output can be used with your favorite CSS-in-JS library like emotion, styled-components ... The classes string output can be used with the xwind cli to generate a minimal css file of the used Tailwind classes.

### Output mode "objectstyles" example

```js
import xw from "xwind";

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

Plugins make it possible to support any CSS-in-JS library syntax.

### Output mode "classes" example

```js
import xw from "xwind";

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

### [Full xwind package documentation](https://github.com/Arthie/tailwindcssinjs/tree/xwind/packages/xwind)

---

### [typescript-xwind-plugin](https://github.com/Arthie/tailwindcssinjs/tree/xwind/packages/typescript-plugin)

This package is a typescript language service plugin that adds editor support for [xwind](https://github.com/Arthie/tailwindcssinjs/tree/master/packages/macro) tagged template syntax: xw\`...\` or tw\`...\`

![autocomplete](https://github.com/Arthie/vscode-tailwindcssinjs/raw/master/resources/autocomplete.gif)

---

### [xwind VS Code extension](https://github.com/Arthie/vscode-xwind)

This extension activates typescript-xwind-plugin inside VS Code's Typescript language service.

## Developer packages

Want to create Tailwind tools with javascript?
Have a look at these packages they make the xwind and typescript-xwind-plugin possible.

### [@xwind/class-utilities](https://github.com/Arthie/tailwindcssinjs/tree/xwind/packages/class-utilities)

The class-utilities package contains flexible utilities to compose and parse Tailwind classes.

---

### [@xwind/core](https://github.com/Arthie/tailwindcssinjs/tree/xwind/packages/core) (WIP)

The core package uses Tailwind internals to extracts/generate all the data you could want from Tailwind. It provides the data in a structured way with the necessary utilities to create and manipulate this data.

## Non-Affiliation disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Tailwind Labs Inc., or any of its subsidiaries or its affiliates.
The name Tailwind as well as related names, marks, emblems and images are registered trademarks of their respective owners.

The official Tailwind website can be found at https://tailwindcss.com/.

Please contact the project ower if there are any concers regarding: [Tailwind CSS brand assets and usage guidelines](https://tailwindcss.com/brand).

## License

[MIT](LICENSE). Copyright (c) 2020 [Arthur Petrie](https://arthurpetrie.com/).
