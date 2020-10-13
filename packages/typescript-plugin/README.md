# typescript-tailwindcssinjs-plugin

[![NPM version](https://badgen.net/npm/v/typescript-tailwindcssinjs-plugin)](https://www.npmjs.com/package/typescript-tailwindcssinjs-plugin)
[![License](https://badgen.net/npm/license/typescript-tailwindcssinjs-plugin)](https://www.npmjs.com/package/typescript-tailwindcssinjs-plugin)

This package is a typescript language service plugin that adds editor support for [@tailwindcssinjs/macro](https://github.com/Arthie/tailwindcssinjs/tree/master/packages/macro) tagged template syntax: tw\`...\`

## Install

```bash
# with npm
npm install -D typescript-tailwindcssinjs-plugin

# with Yarn
yarn add -D typescript-tailwindcssinjs-plugin
```

## Usage

Configure the `plugins` section in your _tsconfig.json_ to add the language service plugin.

```jsonc
{
  "compilerOptions": {
    //compiler options...
    "plugins": [
      {
        "name": "typescript-tailwindcssinjs-plugin",
        "config": "./tailwind.config.js", //tailwind config filepath
        "ignoreErrors": null //regex pattern string or null
      }
    ]
  }
}
```

**Note**: If you're using VS Code, you'll have to use the workspace TypeScript version or install the [VS Code extension](https://github.com/Arthie/vscode-tailwindcssinjs).

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.
