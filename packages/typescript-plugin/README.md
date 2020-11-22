# typescript-xwind-plugin

[![NPM version](https://badgen.net/npm/v/typescript-xwind-plugin)](https://www.npmjs.com/package/typescript-xwind-plugin)
[![License](https://badgen.net/npm/license/typescript-xwind-plugin)](https://www.npmjs.com/package/typescript-xwind-plugin)

This package is a typescript language service plugin that adds editor support for [xwind](https://github.com/Arthie/tailwindcssinjs/tree/xwind/packages/xwind) tagged template syntax: tw\`...\` or xw\`...\`

## Install

```bash
# with npm
npm install -D typescript-xwind-plugin

# with Yarn
yarn add -D typescript-xwind-plugin
```

## Usage

Configure the `plugins` section in your `tsconfig.json` to add the language service plugin.

```jsonc
{
  "compilerOptions": {
    //compiler options...
    "plugins": [
      {
        "name": "typescript-xwind-plugin",
        "config": ".../User/.../tailwind.config.js", //Absolute filepath to tailwind config
        "ignoreErrors": null, //regex pattern string or null
        "tags": ["tw", "xw"] //tags that trigger xwind plugin
      }
    ]
  }
}
```

**Note**: If you're using VS Code, you'll have to use the workspace TypeScript version or install the [VS Code extension](https://github.com/Arthie/vscode-xwind).

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.
