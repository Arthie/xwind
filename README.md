<p align="center">
  <img src="https://github.com/Arthie/tailwindcssinjs/raw/master/resources/header.png" alt="tailwindcssinjs">
</p>

This repo contains a collection of packages that makes the integration of Tailwind with CSS-in-JS libraries easier.

## Why does this exist?

You may have encountered some of these problems when using Tailwind with CSS-in-JS libraries.

- You have to use PurgeCSS to get the minimal CSS file. PurgeCSS relies on string matching.
- No warnings when misspelling, refactoring or using a class that doesn't exist
- Inline classes can get very long and hard to read
- You have to specify the variants for utility classes in tailwind.config.js
- Developer experience/tooling is lacking

## Features / Goals

- Solve all of the above problems
- Automatically compatible with latest Tailwind version **>1.6.x**
- New syntax to apply variants to multiple utility classes `md:hover[text-xs font-normal]`
- Reacts to changes in made in `tailwind.config.js`
- Great developer experience with vscode extension or typescript-plugin
- No runtime impact all transformations happen during build time
- Plugins to support any/your favorite CSS-in-JS syntax

### Support for all Tailwind features:

- All utility and component classes
- All variant utility classes enabled
- Full support for custom classes and `tailwind.config.js` customization
- Supports Tailwind plugins (tailwind-ui, custom-forms, ...)

## Packages

### [@tailwindcssinjs/macro](https://github.com/Arthie/tailwindcssinjs/tree/master/packages/macro)

`@tailwindcssinjs/macro` is a babel macro that transforms Tailwind classes into CSS object styles. These CSS object styles can be used with your favorite CSS-in-JS library like emotion, styled-components ...

### Basic example

```js
import tw from "@tailwindcssinjs/macro";

const styles = tw`text-red-100 hover:text-green-100 hover:bg-blue-200`;
// OR (with custom array syntax)
const styles = tw`text-red-100 hover[text-green-100 bg-blue-200]`;
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

Transform to CSS string syntax with the CSS string plugin:

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

### [@tailwindcssinjs/macro Documentation](https://github.com/Arthie/tailwindcssinjs/tree/master/packages/macro)

---

### [typescript-tailwindcssinjs-plugin](https://github.com/Arthie/tailwindcssinjs/tree/master/packages/typescript-plugin) (WIP)

This package is a typescript language service plugin that adds editor support for [@tailwindcssinjs/macro](https://github.com/Arthie/tailwindcssinjs/tree/master/packages/macro) tagged template syntax: tw\`...\`

![autocomplete](https://github.com/Arthie/vscode-tailwindcssinjs/raw/master/resources/autocomplete.gif)

### [tailwindcssinjs vscode extension](https://github.com/Arthie/vscode-tailwindcssinjs)

---

## Developer packages

Want to create Tailwind tools with javascript?
Have a look at these packages they make the macro and typescript-plugin possible.

### [@tailwindcssinjs/class-composer](https://github.com/Arthie/tailwindcssinjs/tree/master/packages/class-composer)

The class-composer package contains flexible utilities to compose and parse Tailwind classes.

### [@tailwindcssinjs/tailwind-data](https://github.com/Arthie/tailwindcssinjs/tree/master/packages/tailwindcss-data) (WIP)

The tailwind-data package uses Tailwind internals to extracts/generate all the data you could want from Tailwind. It provides the data in a structured way with the necessary utilities to create and manipulate this data.

---

## License

[MIT](LICENSE). Copyright (c) 2020 [Arthur Petrie](https://arthurpetrie.com/).
