# @tailwindcssinjs/class-composer
===========


[![NPM version](https://badgen.net/npm/v/@tailwindcssinjs/class-composer)](https://www.npmjs.com/package/@tailwindcssinjs/class-composer)
[![License](https://badgen.net/npm/license/@tailwindcssinjs/class-composer)](https://www.npmjs.com/package/@tailwindcssinjs/class-composer)

Simple utilities to compose tailwindcss classNames.

```bash
# with npm
npm install @tailwindcssinjs/class-composer

# with Yarn
yarn add @tailwindcssinjs/class-composer
```

## Usage

## Tailwind class arguments

The arguments you can pass are very flexable. You can provide tailwind classes as a `string`, `variants object` or an `array of strings / variants objects`.

### string examples
These work exactly the same as regular tailwind class strings

```js
//regular string
tw("text-red-100")
//variant
tw("hover:text-red-100")
//multiple classnames
tw("text-red-100 hover:text-red-100")

//tag regular string
tw`text-red-100`
//tag variant
tw`hover:text-red-100`
//tag multiple classnames
tw`text-red-100 hover:text-red-100`
```

### utility variants object examples

Tailwind class variants object applies the variant (object key) to utility classes (object variant). This is usefull to structure a long list of classes.

`note:`
- pseudo variants cannot contain variant objects
- this can only be used for utility classes

```js
//pseudo variant
tw({hover: "text-red-100"})
//tagged pseudo variant
tw`${{hover: "text-red-100"}}`
//same output as
tw("hover:text-red-100")

//media variant
tw({lg:"text-red-100"})
//tagged media variant
tw`${{lg:"text-red-100"}}`
//same output as
tw("lg:text-red-100")

//variant to all classes
tw({hover: "text-red-100 bg-red-200"})
//tag variant to all classes
tw`${{hover: "text-red-100 bg-red-200"}}`
//same output as
tw("hover:text-red-100 hover:bg-red-200")

//combined variant
tw({lg:{hover:"text-red-100"}, "md:focus": "text-red-200"})
//tag combined variant
tw`${{lg:{hover:"text-red-100"}, "md:focus": "text-red-200"}}`
//same output as
tw("lg:hover:text-red-100 md:focus:text-red-200")
```

### array examples

You can pass as many arguments as you want or pass an array of arguments

```js
//multiple arguments
tw("text-red-100", {hover: "text-red-200"}, "bg-blue-100")
//tagged multiple arguments
tw`text-red-100 ${hover: "text-red-200"} bg-blue-100`

//array
tw(["text-red-100", {hover: "text-red-200"}, "bg-blue-100"])
```

## Tailwind class functions

### twClassesComposer usage

Takes class arguments or template and returns a string array of tailwind classnames

```js
import { twClassesComposer } from "@tailwindcssinjs/class-composer"

twClassesComposer("text-red-100 hover:bg-red-200 sm:active:bg-red-300");
// OR
twClassesComposer`text-red-100 hover:bg-red-200 sm:active:bg-red-300`;

//only function arguments
twClassesComposerFunction("text-red-100 hover:bg-red-200 sm:active:bg-red-300");
//only tagged template
twClassesComposerTag`text-red-100 hover:bg-red-200 sm:active:bg-red-300`;

//Result: [ "text-red-100", "hover:bg-red-200", "sm:active:bg-red-300" ]
```

### twSerializer usage

Takes class arguments or template and returns a string with tailwind classnames

```js
import { twSerializer } from "@tailwindcssinjs/class-composer"

twSerializer("text-red-100 hover:bg-red-200 sm:active:bg-red-300");
// OR
twSerializer`text-red-100 hover:bg-red-200 sm:active:bg-red-300`;

//only function arguments
twSerializerFunction("text-red-100 hover:bg-red-200 sm:active:bg-red-300");
//only tagged template
twSerializerTag`text-red-100 hover:bg-red-200 sm:active:bg-red-300`;

//Result: "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
```

### twClassesVariantsParser usage

Takes tailwind class arguments or template and returns an array of tailwind class variants tupels

```js
import { twClassesVariantsParser } from "@tailwindcssinjs/class-composer"

twClassesVariantsParser("text-red-100 hover:bg-red-200 sm:active:bg-red-300");
// OR
twClassesVariantsParser`text-red-100 hover:bg-red-200 sm:active:bg-red-300`;

//only function arguments
twClassesVariantsParserFunction("text-red-100 hover:bg-red-200 sm:active:bg-red-300");
//only tagged template
twClassesVariantsParserTag`text-red-100 hover:bg-red-200 sm:active:bg-red-300`;

//Result: [
//   ["text-red-100", []],
//   ["bg-red-200", ["hover"]],
//   ["bg-red-300", ["active", "sm"]]
// ]
```

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.