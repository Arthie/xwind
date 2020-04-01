<div align="center">
<h1>tailwindcssinjs</h1>
</div>

This is a mono repo containing packages that make integrating Tailwind with css-in-js libraries easier.

Currently, we have one package ready to be used in Tailwind projects `@tailwindcssinjs/macro`. The other packages are for developing Tailwind tools or adding editor tooling support.

---

## @tailwindcssinjs/macro Documentation

`@tailwindcssinjs/marco` is a babel macro that turns Tailwind classes into css-in-js style objects.

## Basic example
```js
import tw from "@tailwindcssinjs/macro"

const styles = tw`text-red-100 hover:bg-blue-200`

//Transformed into:
const styles = {
  color: "#fff5f5",
  "&:hover": {
    backgroundColor: "#bee3f8",
  }
};
```

## Why does this package exist?
This package was created to solve these problems. You may have encountered some when using Tailwind
with css-in-js libraries.
- You need to setup postCSS with your bundler
- You have to use PurgeCSS to get minimal css file
- No way to know if a class exists in Tailwind
- Inline classes can get very long and hard to read
- You have to specify the variants for utility classes in tailwind.config.js

## Features
- Solves all of the above problems
- Compatible with **Tailwind** version **1.2.0** and above
- All utility and component classes
- All variant utility classes
- Full support for custom classes and `tailwind.config.js` customization
- New syntax to apply variants to multiple utility classes
- Supports Tailwind plugins (e.g. tailwind-ui, custom-forms)

## Usage

You can use `@tailwindcssinjs/macro` with your preferred CSS-in-JS library that supports css style objects.

`Note` you will need to restart dev server when changes are made to `./tailwind.config.js` and clear the babel cache

## Install

### 0. Prerequisites:
- Have node 12 or above installed
- Install and configure your bundler with [babel](https://github.com/babel/babel) and [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros)

### 2. Install packages
```bash
# with npm
npm install --save-dev @tailwindcssinjs/macro tailwindcss

# with Yarn
yarn add -D @tailwindcssinjs/macro tailwindcss
```

### 3. Add Tailwind base css
```js
import "tailwindcss/dist/base.min.css";
```

### 4. Create a Tailwind config file (optional)
```bash
npx tailwindcss init
```
Check out the [Tailwind documentation](https://tailwindcss.com/) for customizing the Tailwind config file

## Advanced Examples

[Codesandbox](https://codesandbox.io/s/tailwindcssinjsmacro-simple-example-wds6l) with Typescript, [Nextjs](https://nextjs.org/) and [Emotion](https://emotion.sh/docs/introduction)

#### React + Emotion: Button component example
```js
import { css, cx } from "@emotion/css";
import tw from "@tailwindcssinjs/macro";

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
  iconWrapper: css(tw`
    absolute left-0 inset-y-0
    flex items-center
    pl-3
  `),
  icon: css(tw`
    h-5 w-5
    text-gray-500
    group-hover:text-gray-400
    transition ease-in-out duration-150
  `)
};

const Button = ({ className, children, ...props }) => (
  <button {...props} className={cx(styles.button, "group", className)}>
    <span className={styles.iconWrapper}>
      <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
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

export default Button
```

---

## License

[MIT](LICENSE). Copyright (c) 2020 [Arthur Petrie](https://arthurpetrie.com/).
