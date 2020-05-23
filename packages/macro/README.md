# @tailwindcssinjs/macro

[![NPM version](https://badgen.net/npm/v/@tailwindcssinjs/macro)](https://www.npmjs.com/package/@tailwindcssinjs/macro)
[![License](https://badgen.net/npm/license/@tailwindcssinjs/macro)](https://www.npmjs.com/package/@tailwindcssinjs/macro)
[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

### [Documentation](https://github.com/Arthie/tailwindcssinjs)

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

If you use Tailwind plugins that register new base styles you will need to generate a customized base css file.

<details>
  <summary>Generate base css with Tailwind cli</summary>

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

## Advanced Examples

[Codesandbox](https://codesandbox.io/s/tailwindcssinjsmacro-simple-example-wds6l?file=/pages/index.tsx) with Typescript, [Nextjs](https://nextjs.org/) and [Emotion](https://emotion.sh/docs/introduction)

[Official Next.js example - Tailwind CSS with Emotion.js](https://github.com/zeit/next.js/tree/canary/examples/with-tailwindcss-emotion)

#### React + Emotion: Button component example

```js
import React from "react";
import { css, cx } from "@emotion/css";
import tw from "@tailwindcssinjs/macro";

//"React native style"
const styles = {
  button: css(tw`
    relative
    w-full
    flex justify-center
    py-2 px-4
    border border-transparent
    text-sm leading-5 font-medium
    rounded-md
    text-white
    bg-gray-600
    hover:bg-gray-500
    focus[outline-none border-gray-700 shadow-outline-gray]
    active:bg-gray-700
    transition duration-150 ease-in-out
  `),
};

const Button = ({ className, children, ...props }) => (
  <button {...props} className={cx(styles.button, "group", className)}>
    {/* inline style */}
    <span className={css(tw`absolute left-0 inset-y-0 flex items-center pl-3`)}>
      <svg
        className={css(
          tw`h-5 w-5 text-gray-500 group-hover:text-gray-400 transition ease-in-out duration-150`
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    </span>
    {children}
  </button>
);

export default Button;
```

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.
