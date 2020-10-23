// recursive type: string | string array | nested string array (no depth limit)
export type TwClasses = string | TwClasses[];

export type ParsedTwClass = [string, string[]];

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
    `(\\S+(?:\\${separator}\\w+)?)\\[((?:.|\\n)*?)\\]`,
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
    // searchResult contains substring capture groups
    const [variant, variantclasses] = searchResult as [string, string];

    // matches tailwind classes and removes whitespace
    // " text-red-100  bg-blue-200 " => ["text-red-100", "bg-blue-200"]
    const twClasses = variantclasses.match(NOT_WHITE_SPACE_REGEX) ?? [];

    const replacementClasses = [];
    for (const twClass of twClasses) {
      replacementClasses.push(`${variant}${separator}${twClass}`);
    }
    return replacementClasses.join(" ");
  };

  return (...twClasses: TwClasses[]) => {
    // combines all arguments into a string
    // @ts-expect-error - typescript Array type is broken: lib.es2019.array.d.ts:23:5 - error TS2502: '"recur"' is referenced directly or indirectly in its own type annotation.
    const twClassesString = twClasses.flat<TwClasses[], 1>(Infinity).join(" ");

    if (NESTED_ANGLE_BRACKET_REGEXP.test(twClassesString)) {
      throw new Error(`Nested variant arrays are not allowed`);
    }

    // replaces variant array syntax
    const replacedTwClassesString = twClassesString.replace(
      VARIANT_ARRAY_SYNTAX_REGEX,
      variantArraySyntaxReplacer
    );

    // matches tailwind classes and removes whitespace
    // " text-red-100  bg-blue-200 " => ["text-red-100", "bg-blue-200"]
    const composedTwClasses = Array.from(
      replacedTwClassesString.match(NOT_WHITE_SPACE_REGEX) ?? []
    );

    //Remove duplicate classes
    return Array.from(new Set(composedTwClasses.reverse())).reverse();
  };
}

/**
 * Takes a separator string (e.g. ":") as parameter and returns a composer function.
 * The composer function will return an array of class and variants tuples.
 * Docs + example: https://github.com/Arthie/tailwindcssinjs/tree/master/packages/class-composer#2-twclassesvariantsparser
 */
export function twClassesParser(separator: string) {
  const composer = twClassesComposer(separator);
  return (...twClasses: TwClasses[]) => {
    const composedTwClasses = composer(twClasses);

    const parsedClasses: ParsedTwClass[] = [];
    for (const composedTwClass of composedTwClasses) {
      const [twClass, ...variants] = composedTwClass.split(separator).reverse();
      parsedClasses.push([twClass, variants]);
    }

    return parsedClasses;
  };
}

/**
 * Takes a separator string (e.g. ":") as parameter and returns a composer function.
 * The composer function takes an array of parsed tailwind classes and return an Array of tailwind classes.
 */
export function twClassesGenerator(separator: string) {
  return (parsedTwClasses: ParsedTwClass[]) => {
    const twClasses: string[] = [];
    for (const [twClass, variants] of parsedTwClasses) {
      if (variants.length) {
        twClasses.push(
          variants.reverse().join(separator) + separator + twClass
        );
      } else {
        twClasses.push(twClass);
      }
    }
    return twClasses;
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

export default function (separator: string, variants?: string[]) {
  if (variants) {
    for (const variant of variants) {
      if (variant.includes(separator)) {
        throw new Error(
          `Variant name: "${variant}" can't contain separator: "${separator}"`
        );
      }
    }
  }
  return {
    composer: twClassesComposer(separator),
    parser: twClassesParser(separator),
    serializer: twClassesSerializer(separator),
    generator: twClassesGenerator(separator),
  };
}
