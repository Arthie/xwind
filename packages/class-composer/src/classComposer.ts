import "core-js/stable/array/flat";

//recursive type: string | string array | nested string array (no depth limit)
export type TwClasses = string | TwClasses[];

/**
 * Takes a separator string (e.g. ":") as parameter and returns a composer function.
 * The composer function will return a Array of tailwind classes.
 * Docs + example: https://github.com/Arthie/tailwindcssinjs/tree/master/packages/class-composer#1-twclassescomposer
 */
export function twClassesComposer(separator: string) {
  if (typeof separator !== "string") {
    throw new Error(`Separator "${separator}" must be of type String`);
  }

  const NOT_WHITE_SPACE_REGEX = /\S+/g;

  // captures variant arrays syntax =>  sm:hover[text-red-100 bg-blue-200]
  const VARIANT_ARRAY_SYNTAX_REGEX = new RegExp(
    `(?<variant>\\S+(?:\\${separator}\\w+)?)\\[(?<classes>(?:.|\\n)*?)\\]`,
    "g"
  );

  // captures nested angle brackets => [[]]
  const NESTED_ANGLE_BRACKET_REGEXP = /(\[([^\[\]]){0,}\[)|(\]([^\[\]]){0,}\])/g;

  /**
   * replaces variant array syntax to regular tailwind class syntax
   * sm:hover[text-red-100 bg-blue-200] => sm:hover:text-red-100 sm:hover:bg-blue-200
   */
  const variantArraySyntaxReplacer = (
    _substring: string,
    ...searchResult: any[]
  ) => {
    //searchResult contains substring capture groups
    const [variant, variantclasses] = searchResult as [string, string];

    //matches tailwind classes and removes whitespace
    //" text-red-100  bg-blue-200 " => ["text-red-100", "bg-blue-200"]
    const twClasses = variantclasses.match(NOT_WHITE_SPACE_REGEX) ?? [];

    const replacementClasses = [];
    for (const twClass of twClasses) {
      replacementClasses.push(`${variant}${separator}${twClass}`);
    }
    return replacementClasses.join(" ");
  };

  return (...twClasses: TwClasses[]) => {
    //combines all arguments into a string
    //@ts-expect-error - typescript Array type is broken: lib.es2019.array.d.ts:23:5 - error TS2502: '"recur"' is referenced directly or indirectly in its own type annotation.
    const twClassesString = twClasses.flat<any[]>(Infinity).join(" ");

    if (NESTED_ANGLE_BRACKET_REGEXP.test(twClassesString)) {
      throw new Error(`Nested variant arrays are not allowed`);
    }

    //replaces variant array syntax
    const replacedTwClasses = twClassesString.replace(
      VARIANT_ARRAY_SYNTAX_REGEX,
      variantArraySyntaxReplacer
    );

    //matches tailwind classes and removes whitespace
    //" text-red-100  bg-blue-200 " => ["text-red-100", "bg-blue-200"]
    return Array.from(replacedTwClasses.match(NOT_WHITE_SPACE_REGEX) ?? []);
  };
}

/**
 * Takes a separator string (e.g. ":") as parameter and returns a composer function.
 * The composer function will return an array of class and variants tuples.
 * Docs + example: https://github.com/Arthie/tailwindcssinjs/tree/master/packages/class-composer#2-twclassesvariantsparser
 */
export function twClassesVariantsParser(separator: string) {
  const composer = twClassesComposer(separator);
  return (...twClasses: TwClasses[]) => {
    const composedTwClasses = composer(twClasses);

    const parsedClassesVariants: [string, string[]][] = [];
    for (const composedTwClass of composedTwClasses) {
      const [twClass, ...variants] = composedTwClass.split(separator).reverse();
      parsedClassesVariants.push([twClass, variants]);
    }

    return parsedClassesVariants;
  };
}

/**
 * Takes a separator string (e.g. ":") as parameter and returns a composer function.
 * The composer function will return a tailwind classes string
 * Docs + example: https://github.com/Arthie/tailwindcssinjs/tree/master/packages/class-composer#3-twclassesserializer
 */
export function twClassesSerializer(separator: string) {
  const composer = twClassesComposer(separator);
  return (...twClasses: TwClasses[]) => composer(twClasses).join(" ");
}
