# @xwind/class-utilities

[![NPM version](https://badgen.net/npm/v/@xwind/class-utilities)](https://www.npmjs.com/package/@xwind/class-utilities)
[![License](https://badgen.net/npm/license/@xwind/class-utilities)](https://www.npmjs.com/package/@xwind/class-utilities)

Simple utilities to compose tailwindcss classes.

## Install

```bash
# with npm
npm install @xwind/class-utilities

# with Yarn
yarn add @xwind/class-utilities
```

## API

### utility function parameters

#### `utility(string | string[] | string[][], ...)`

Valid utility function parameters are:

- Classes string
- Array of classes strings
- Nested Arrays containing class strings (nesting has no depth limit)

The utility functions returned result will have removed unnecessary whitespace and duplicate classes.

`Note:` It will return the classes in the same order as the input parameters, from left to right.

#### Variant array syntax

`"variant[class1 class2]" => "variant:class1 variant:class2"`  
Support for custom variant array syntax.
The variant in front of the angle brackets gets applied to the classes inside.

`Note:` Nesting of variant arrays is not allowed.

#### Example

```js
import initClassUtilities from "@xwind/class-utilities";

const classUtilities = initClassUtilities(":");

classUtilities.serializer(
  "text-red-100 hover:bg-red-200 hover:m-4 sm:hover:bg-red-300"
);

classUtilities.serializer(
  "text-red-100",
  "hover:bg-red-200 hover:m-4",
  "sm:hover:bg-red-300"
);

classUtilities.serializer("text-red-100", [
  "hover:bg-red-200",
  "hover:m-4",
  ["sm:hover:bg-red-300"],
]);

classUtilities.serializer(
  "text-red-100 hover[bg-red-200 m-4] sm[hover:bg-red-300]"
);

//Same Result: "text-red-100 hover:bg-red-200 hover:m-4 sm:hover:bg-red-300"
```

### initClassUtilities

#### initClassUtilities(separator:string, variants?: string[] | undefined): ClassUtilities

The initClassUtilities function is the default export of "@xwind/class-utilities"
This function takes a seperator string and variants array as parameters.
The varians array is optional and used to check if the variants names are allowed.
The function returns an classUtilities object

#### Example

```js
import initClassUtilities from "@xwind/class-utilities";

const classUtilities = initClassUtilities(":");

const tw = classUtilities.composer(
  "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
);
//Result: [ "text-red-100", "hover:bg-red-200", "sm:active:bg-red-300" ]

const tw = classUtilities.parser(
  "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
);
//Result: [
//  {
//    class: "text-red-100",
//    variants: [],
//  },
//  {
//    class: "bg-red-200",
//    variants: ["hover"],
//  },
//  {
//    class: "bg-red-300",
//    variants: ["active", "sm"],
//  },
//]

const tw = classUtilities.serializer(
  "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
);
//Result: "text-red-100 hover:bg-red-200 sm:active:bg-red-300"

const tw = classUtilities.generator(
  {
    class: "text-red-100",
    variants: [],
  },
  [
    {
      class: "bg-red-200",
      variants: ["hover"],
    },
    {
      class: "bg-red-300",
      variants: ["active", "sm"],
    },
  ]
);
//Result: [ "text-red-100", "hover:bg-red-200", "sm:active:bg-red-300" ]
```

### 1. composer

#### `composer(separator:string, ...classes: string | string[] | string[][]): string[]`

The compposer function will return an Array of tailwind class strings.

#### Examples

```js
import { composer } from "@xwind/class-utilities";

const tw = composer(":", "text-red-100 hover:bg-red-200 sm:active:bg-red-300");
//Result: [ "text-red-100", "hover:bg-red-200", "sm:active:bg-red-300" ]
```

```js
import initClassUtilities from "@xwind/class-utilities";

const classUtilities = initClassUtilities(":");

const tw = classUtilities.composer(
  "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
);
//Result: [ "text-red-100", "hover:bg-red-200", "sm:active:bg-red-300" ]
```

### 2. parser

#### `parser(separator:string, ...classes: string | string[] | string[][]): {class:string, variants: string[]}[]`

The parser function will return an Array of parsed tailwind classes.

`Note:` The parsed variants will be in order of application

#### Examples

```js
import { parser } from "@xwind/class-utilities";

const tw = parser(":", "text-red-100 hover:bg-red-200 sm:active:bg-red-300");
//Result: [
//  {
//    class: "text-red-100",
//    variants: [],
//  },
//  {
//    class: "bg-red-200",
//    variants: ["hover"],
//  },
//  {
//    class: "bg-red-300",
//    variants: ["active", "sm"],
//  },
//]
```

```js
import initClassUtilities from "@xwind/class-utilities";

const classUtilities = initClassUtilities(":");

const tw = classUtilities.parser(
  "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
);
//Result: [
//  {
//    class: "text-red-100",
//    variants: [],
//  },
//  {
//    class: "bg-red-200",
//    variants: ["hover"],
//  },
//  {
//    class: "bg-red-300",
//    variants: ["active", "sm"],
//  },
//]
```

### 3. serializer

#### `serializer(separator:string, ...classes: string | string[] | string[][]): string[]`

The serializer function will return a string of tailwind classes.

#### Examples

```js
import { serializer } from "@xwind/class-utilities";

const tw = serializer(
  ":",
  "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
);
//Result: "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
```

```js
import initClassUtilities from "@xwind/class-utilities";

const classUtilities = initClassUtilities(":");

const tw = classUtilities.serializer(
  "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
);
//Result: "text-red-100 hover:bg-red-200 sm:active:bg-red-300"
```

### 4. generator

#### `generator(separator:string, ...twParsedClasses: TwParsedClass | TwParsedClass[] | TwParsedClass[][]): string[]`

The generator function will return a string of tailwind classes.

#### Examples

```js
import { generator } from "@xwind/class-utilities";

const tw = generator(
  ":",
  {
    class: "text-red-100",
    variants: [],
  },
  [
    {
      class: "bg-red-200",
      variants: ["hover"],
    },
    {
      class: "bg-red-300",
      variants: ["active", "sm"],
    },
  ]
);
//Result: [ "text-red-100", "hover:bg-red-200", "sm:active:bg-red-300" ]
```

```js
import initClassUtilities from "@xwind/class-utilities";

const classUtilities = initClassUtilities(":");

const tw = classUtilities.generator(
  {
    class: "text-red-100",
    variants: [],
  },
  [
    {
      class: "bg-red-200",
      variants: ["hover"],
    },
    {
      class: "bg-red-300",
      variants: ["active", "sm"],
    },
  ]
);
//Result: [ "text-red-100", "hover:bg-red-200", "sm:active:bg-red-300" ]
```

## License

[MIT](LICENSE). Copyright (c) 2020 Arthur Petrie.
