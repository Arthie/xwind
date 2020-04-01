# @tailwindcssinjs/class-composer

[![NPM version](https://badgen.net/npm/v/@tailwindcssinjs/class-composer)](https://www.npmjs.com/package/@tailwindcssinjs/class-composer)
[![License](https://badgen.net/npm/license/@tailwindcssinjs/class-composer)](https://www.npmjs.com/package/@tailwindcssinjs/class-composer)

Simple utilities to compose tailwindcss classes.

```bash
# with npm
npm install @tailwindcssinjs/class-composer

# with Yarn
yarn add @tailwindcssinjs/class-composer
```

## API

### twClassesComposer

#### `twClassesComposer(string): function`
Takes a separator string (e.g. ":") as parameter and returns a composer function.
The composer function will return a Array of tailwind classes

#### Example
```js
import { twClassesComposer } from "@tailwindcssinjs/class-composer"

const tw = twClassesComposer(":")

tw("text-red-100 hover:bg-red-200 sm:active:bg-red-300");

//Result: [ "text-red-100", "hover:bg-red-200", "sm:active:bg-red-300" ]
```

### twClassesVariantsParser

#### `twClassesComposer(string): function`
Takes a separator string (e.g. ":") as parameter and returns a composer function.
The composer function will return an array of class and variants tuples

#### Example
```js
import { twClassesVariantsParser } from "@tailwindcssinjs/class-composer"

const tw = twClassesVariantsParser(":")

tw("text-red-100 hover:bg-red-200 sm:active:bg-red-300");

//Result: [
//   ["text-red-100", []],
//   ["bg-red-200", ["hover"]],
//   ["bg-red-300", ["active", "sm"]]
// ]
```

### twClassesSerializer

#### `twClassesSerializer(string): function`
Takes a separator string (e.g. ":") as parameter and returns a composer function.
The composer function will return a tailwind classes string

#### Example
```js
import { twClassesSerializer } from "@tailwindcssinjs/class-composer"

const tw = twClassesSerializer(":")

tw("text-red-100 hover:bg-red-200 sm:active:bg-red-300");

//Result: "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
```

### composer function parameters

#### `tw(string | string[] | string[][], ...)`

Valid composer function parameters are:
  - Classes string
  - Array of classes strings
  - Nested Arrays containing class strings

`Note:` It will return the composed classes in the same order as the input parameters, from left to right.

#### Variant syntax
`"variant[class1 class2]"  =>  "variant:class1 variant:class2"`  
Support for variant array syntax.
The variant in front of the angle brackets gets applied to the classes inside.  

`Note:` Nesting of variant arrays is not allowed.

#### Example
```js
import { twClassesSerializer } from "@tailwindcssinjs/class-composer"

const tw = twClassesSerializer(":")

tw("text-red-100 hover:bg-red-200 hover:m-4 sm:hover:bg-red-300");

tw("text-red-100", "hover:bg-red-200 hover:m-4", "sm:hover:bg-red-300");

tw("text-red-100", ["hover:bg-red-200", "hover:m-4", ["sm:hover:bg-red-300"]]);

tw("text-red-100 hover[bg-red-200 m-4] sm[hover:bg-red-300]");

//Same Result: "text-red-100 hover:bg-red-200 hover:m-4 sm:hover:bg-red-300"
```

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.# @tailwindcssinjs/class-composer

[![NPM version](https://badgen.net/npm/v/@tailwindcssinjs/class-composer)](https://www.npmjs.com/package/@tailwindcssinjs/class-composer)
[![License](https://badgen.net/npm/license/@tailwindcssinjs/class-composer)](https://www.npmjs.com/package/@tailwindcssinjs/class-composer)

Simple utilities to compose tailwindcss classes.

```bash
# with npm
npm install @tailwindcssinjs/class-composer

# with Yarn
yarn add @tailwindcssinjs/class-composer
```

## API

### twClassesComposer

#### `twClassesComposer(string): function`
Takes a separator string (e.g. ":") as parameter and returns a composer function.
The composer function will return a Array of tailwind classes

#### Example
```js
import { twClassesComposer } from "@tailwindcssinjs/class-composer"

const tw = twClassesComposer(":")

tw("text-red-100 hover:bg-red-200 sm:active:bg-red-300");

//Result: [ "text-red-100", "hover:bg-red-200", "sm:active:bg-red-300" ]
```

### twClassesVariantsParser

#### `twClassesComposer(string): function`
Takes a separator string (e.g. ":") as parameter and returns a composer function.
The composer function will return an array of class and variants tuples

#### Example
```js
import { twClassesVariantsParser } from "@tailwindcssinjs/class-composer"

const tw = twClassesVariantsParser(":")

tw("text-red-100 hover:bg-red-200 sm:active:bg-red-300");

//Result: [
//   ["text-red-100", []],
//   ["bg-red-200", ["hover"]],
//   ["bg-red-300", ["active", "sm"]]
// ]
```

### twClassesSerializer

#### `twClassesSerializer(string): function`
Takes a separator string (e.g. ":") as parameter and returns a composer function.
The composer function will return a tailwind classes string

#### Example
```js
import { twClassesSerializer } from "@tailwindcssinjs/class-composer"

const tw = twClassesSerializer(":")

tw("text-red-100 hover:bg-red-200 sm:active:bg-red-300");

//Result: "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
```

### composer function parameters

#### `tw(string | string[] | string[][], ...)`

Valid composer function parameters are:
  - Classes string
  - Array of classes strings
  - Nested Arrays containing class strings

`Note:` It will return the composed classes in the same order as the input parameters, from left to right.

#### Variant syntax
`"variant[class1 class2]"  =>  "variant:class1 variant:class2"`  
Support for variant array syntax.
The variant in front of the angle brackets gets applied to the classes inside.  

`Note:` Nesting of variant arrays is not allowed.

#### Example
```js
import { twClassesSerializer } from "@tailwindcssinjs/class-composer"

const tw = twClassesSerializer(":")

tw("text-red-100 hover:bg-red-200 hover:m-4 sm:hover:bg-red-300");

tw("text-red-100", "hover:bg-red-200 hover:m-4", "sm:hover:bg-red-300");

tw("text-red-100", ["hover:bg-red-200", "hover:m-4", ["sm:hover:bg-red-300"]]);

tw("text-red-100 hover[bg-red-200 m-4] sm[hover:bg-red-300]");

//Same Result: "text-red-100 hover:bg-red-200 hover:m-4 sm:hover:bg-red-300"
```

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.