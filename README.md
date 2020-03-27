# tailwindcssinjs

This is a mono repo containing packages that make integrating tailwind with css-in-js libraries easier.

Currently we have one package ready to be used in tailwind projects `@tailwindcssinjs/macro`. The other packages are for developing tailwind tools or adding editor tooling support.

`@tailwindcssinjs/marco` is a babel macro that turns tailwind classes into css-in-js style objects

## Basic example
```js
import tw from "@tailwindcssinjs/macro"

const styles = tw`text-red-100 hover:bg-blue-200`
```
get turned into
```js
const styles = {
  color: "#fff5f5",
  "&:hover": {
    backgroundColor: "#bee3f8",
  },
};
```

## Features
- Tailwind version `1.2.0`
- Utility classes including from custom plugins
- Component classes (e.g. `container`) including from custom plugins (e.g. `custom-forms`)
- Default pseudo-class variants (limited support for custom variants  plugins)
- Custom breakpoints/media queries
- Typescript definitions
- Flexible syntax to compose classes


## Install

Prerequisite: use babel with your bundler and have babel macros installed

```bash
# with npm
npm install @tailwindcssinjs/macro

# with Yarn
yarn add @tailwindcssinjs/macro
```

## Usage

You can use `@tailwindcssinjs/macro` with your preferred CSS-in-JS library that supports css style objects.

### emotion

### styled-components

## Advanced Example

Codesandbox

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.