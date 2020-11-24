export type TwClass = string;

// recursive type: string | string array | nested string array (no depth limit)
export type TwClasses = string | TwClasses[];

export type TwParsedClass = {
  class: string;
  variants: string[];
};

// recursive type: string | string array | nested string array (no depth limit)
export type TwParsedClasses = TwParsedClass | TwParsedClasses[];

/**
 * Takes a separator string (e.g. ":") as parameter and returns a composer function.
 * The composer function will return a Array of tailwind classes.
 */
export function composer(separator: string, ...twClasses: TwClasses[]) {
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

  // combines all arguments into a string
  const twClassesString = twClasses.flat(Infinity).join(" ");

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

  //Remove first of duplicate classes
  return Array.from(new Set(composedTwClasses.reverse())).reverse();
}

/**
 * Takes a separator string (e.g. ":") as parameter and returns a composer function.
 * The composer function will return an array of class and variants tuples.
 */
export function parser(separator: string, ...twClasses: TwClasses[]) {
  const composedTwClasses = composer(separator, twClasses);

  const parsedClasses: TwParsedClass[] = [];
  for (const composedTwClass of composedTwClasses) {
    const [twClass, ...variants] = composedTwClass.split(separator).reverse();
    parsedClasses.push({
      class: twClass,
      variants,
    });
  }

  return parsedClasses;
}

/**
 * Takes a separator string (e.g. ":") as parameter and returns a composer function.
 * The composer function takes an array of parsed tailwind classes and return an Array of tailwind classes.
 */
export function generator(
  separator: string,
  ...parsedTwClasses: TwParsedClasses[]
) {
  const getTwClasses = (parsedTwClasses: TwParsedClasses[]) => {
    const twClasses: string[] = [];
    for (const parsedTwClassOrParsedTwClassArray of parsedTwClasses) {
      if (Array.isArray(parsedTwClassOrParsedTwClassArray)) {
        const parsedTwClassArray = parsedTwClassOrParsedTwClassArray;
        twClasses.push(...getTwClasses(parsedTwClassArray));
      } else {
        const parsedTwClass = parsedTwClassOrParsedTwClassArray;
        if (parsedTwClass.variants?.length) {
          const twClass = [
            ...Array.from(parsedTwClass.variants).reverse(),
            parsedTwClass.class,
          ].join(separator);
          twClasses.push(twClass);
        } else {
          twClasses.push(parsedTwClass.class);
        }
      }
    }
    return twClasses;
  };

  const twClasses = getTwClasses(parsedTwClasses);
  //Remove first of duplicate classes
  return Array.from(new Set(twClasses.reverse())).reverse();
}

/**
 * Takes a separator string (e.g. ":") as parameter and returns a composer function.
 * The composer function will return a tailwind classes string
 */
export function serializer(separator: string, ...twClasses: TwClasses[]) {
  return composer(separator, twClasses).join(" ");
}

function classUtilities(separator: string, variants?: string[]) {
  for (const variant of variants ?? []) {
    if (variant.includes(separator)) {
      throw new Error(
        `Variant name: "${variant}" can't contain separator: "${separator}"`
      );
    }
  }

  return {
    composer: (...twClasses: TwClasses[]) => composer(separator, twClasses),
    parser: (...twClasses: TwClasses[]) => parser(separator, twClasses),
    serializer: (...twClasses: TwClasses[]) => serializer(separator, twClasses),
    generator: (...parsedTwClasses: TwParsedClasses[]) =>
      generator(separator, parsedTwClasses),
  };
}

export default classUtilities;
