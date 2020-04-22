import "core-js/stable/array/flat";

export type TwClasses = string | TwClasses[];

export const twClassesComposer = (separator: string) => {
  if (typeof separator !== "string") {
    throw new Error(`Separator "${separator}" must be of type String`);
  }

  const NOT_WHITE_SPACE_REGEX = /\S+/g;
  // matches variant arrays =>  sm:hover[text-red-100 bg-blue-200]
  const VARIANT_ARRAY_REGEX = new RegExp(
    `\\S+(${separator}\\w+)?(\\[((.|\\n)*?)\\])`,
    "g"
  );
  // matches nested angle brackets => [[]]
  const NESTED_ANGLE_BRACKET_REGEXP = /(\[([^\[\]]){0,}\[)|(\]([^\[\]]){0,}\])/g;

  /**
   * replaces variant array syntax to regular class syntax
   * sm:hover[text-red-100 bg-blue-200] => sm:hover:text-red-100 sm:hover:bg-blue-200
   * @param match 
   */
  const variantArrayReplacer = (match: string) => {
    //slice last char "]" and split on "["
    const [variant, ...variantClasses] = match.slice(0, -1).split("[");
    const twClasses = variantClasses[0].match(NOT_WHITE_SPACE_REGEX);
    const replacements = [];
    for (const twClass of twClasses ?? []) {
      replacements.push(`${variant}${separator}${twClass}`);
    }
    return replacements.join(" ");
  };

  return (...twClasses: TwClasses[]) => {
    const twClassesString = twClasses.flat(Infinity).join(" ");

    if (NESTED_ANGLE_BRACKET_REGEXP.test(twClassesString)) {
      throw new Error(`Nested variant arrays are not allowed`);
    }

    const convertedClasses = twClassesString.replace(
      VARIANT_ARRAY_REGEX,
      variantArrayReplacer
    );

    return convertedClasses.match(NOT_WHITE_SPACE_REGEX) ?? [];
  };
};

export const twClassesVariantsParser = (separator: string) => {
  const composer = twClassesComposer(separator);
  return (...twClasses: TwClasses[]) => {
    const parsedClassesVariants: [string, string[]][] = [];
    const composedTwClasses = composer(twClasses);

    for (const composedTwClass of composedTwClasses) {
      const [twClass, ...variants] = composedTwClass.split(separator).reverse();
      parsedClassesVariants.push([twClass, variants]);
    }

    return parsedClassesVariants;
  };
};

export const twClassesSerializer = (separator: string) => {
  const composer = twClassesComposer(separator);
  return (...twClasses: TwClasses[]) => composer(twClasses).join(" ");
};
