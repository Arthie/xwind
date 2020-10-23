# @tailwindcssinjs/macro

[![NPM version](https://badgen.net/npm/v/@tailwindcssinjs/macro)](https://www.npmjs.com/package/@tailwindcssinjs/macro)
[![License](https://badgen.net/npm/license/@tailwindcssinjs/macro)](https://www.npmjs.com/package/@tailwindcssinjs/macro)
[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

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

## Install

### 0. Prerequisites:

- Have node 12 or above installed
- Install and configure your bundler with [babel](https://github.com/babel/babel) and [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros)

### 1. Install packages

```bash
# with npm
npm install --save-dev @tailwindcssinjs/macro tailwindcss

# with Yarn
yarn add -D @tailwindcssinjs/macro tailwindcss
```

### 2. Add Tailwind base css

```js
import "tailwindcss/dist/base.min.css";
```

If you use Tailwind plugins that register new base styles you will need to generate a customized base CSS file.

<details>
  <summary>Generate base CSS with Tailwind cli</summary>

#### 2.1 Create a tailwind.base.css file

```css
/* tailwind.base.css */
@tailwind base;
```

#### 2.2 Using Tailwind CLI

```bash
# Use the `npx tailwindcss help build` command to learn more about the various CLI options.
npx tailwindcss build tailwind.base.css -o base.css
```

**Tip:** add this command to your package.json scripts section

#### 2.3 Import base.css

```js
import "base.css";
```

</details>

### 3. Create a Tailwind config file (optional)

```bash
npx tailwindcss init
```

Check out the [Tailwind documentation](https://tailwindcss.com/docs/configuration) for customizing the Tailwind config file.

#### 3.1 Add Tailwind plugins to support all Tailwind features (keyframes, darkmode)

```javascript
//tailwind.config.js
module.exports = {
  // ... config options
  plugins: [
    //Add @keyframes to the base/preflight css file
    plugin(function ({ addBase, addUtilities, e, theme, variants }) {
      const keyframesConfig = theme('keyframes')
      const keyframesStyles = Object.fromEntries(
        Object.entries(keyframesConfig).map(([name, keyframes]) => {
          return [`@keyframes ${name}`, keyframes]
        })
      )
      addBase(keyframesStyles)
    }),
    //Add !important to css rule with variant: important:bg-red-400
    plugin(function ({ addVariant, addUtilities, addComponents, e, prefix, config }) {
      addVariant("important", ({ container }) => {
        container.walkRules((rule) => {
          rule.selector = `.important\\${config("separator")}${rule.selector.slice(1)}`
          rule.walkDecls((decl) => {
            decl.important = true;
          });
        });
      });
    }),
    //Adds tailwindcss official dark mode plugin for tailwind versions 1.X
    require("tailwindcss/lib/flagged/darkModeVariantPlugin").default
  ]
```

## Customization

### Babel macro configuration

```jsonc
// package.json
"babelMacros": {
    "tailwindcssinjs": {
      "config": "./tailwind.config.js",  //Path to 'tailwind.config.js'
      "developmentMode": true //Enable reacting to tailwind.config.js changes
    }
},
```

```js
// babel-plugin-macros.config.js
module.exports = {
  tailwindcssinjs: {
    config: "./tailwind.config.js", //Path to 'tailwind.config.js'
    developmentMode: true, //Enable reacting to tailwind.config.js changes
  },
};
```

### Tailwindcssinjs plugins (experimental)

To support the different CSS-in-JS syntaxes we need a way to change the macro's default output this can be done with tailwindcssinjs plugins.

`note: this is still experimental breaking changes are possible`

tailwindcssinjs plugins are added in the `tailwind.config.js` file

```js
// tailwind.config.js

module.exports = {
  theme: {},
  variants: {},
  plugins: [],

  //this is added
  tailwindcssinjs: {
    plugins: [
      /* your plugins */
    ],
  },
};
```

#### Tailwindcssinjs plugin list

**CSS string**

```js
// tailwind.config.js
module.exports = {
  tailwindcssinjs: {
    plugins: [require("@tailwindcssinjs/macro/lib/plugins/cssString").default];
  }
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
  tailwindcssinjs: {
    plugins: [require("@tailwindcssinjs/macro/lib/plugins/removeFallbacks").default];
  }
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

####

## Advanced Examples

[Codesandbox](https://codesandbox.io/s/tailwindcssinjsmacro-simple-example-nzyu8?file=/pages/index.tsx) with Typescript, [Nextjs](https://nextjs.org/) and [Emotion](https://emotion.sh/docs/introduction)

[Official Next.js example - Tailwind CSS with Emotion.js](https://github.com/zeit/next.js/tree/canary/examples/with-tailwindcss-emotion)

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.
