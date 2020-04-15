import "core-js/stable/array/flat";

export type TwClasses = string | TwClasses[];

export const twClassesComposer = (separator: string) => {
  if (typeof separator !== "string") {
    throw new Error(`Separator "${separator}" must be of type String`);
  }

  const NOT_WHITE_SPACE_REGEX = /\S+/g;
  const VARIANT_ARRAY_REGEX = new RegExp(
    `\\S+(${separator}\\w+)?(\\[((.|\\n)*?)\\])`,
    "g"
  );
  const NESTED_VARIANT_REGEXP = /(\[([^\[\]]){0,}\[)|(\]([^\[\]]){0,}\])/g;

  const variantArrayReplacer = (match: string) => {
    //slice last char "]" and split on "["
    const [variant, ...variantClasses] = match.slice(0, -1).split("[");
    if (variantClasses.length !== 1) {
    }
    const twClasses = variantClasses[0].match(NOT_WHITE_SPACE_REGEX);
    const replacements = [];
    for (const twClass of twClasses ?? []) {
      replacements.push(`${variant}${separator}${twClass}`);
    }
    return replacements.join(" ");
  };

  return (...twClasses: TwClasses[]) => {
    const twClassesString = twClasses.flat(Infinity).join(" ");

    if (NESTED_VARIANT_REGEXP.test(twClassesString)) {
      throw new Error(`Nested variant arrays are not allowed`);
    }

    //replace variant arrays (e.g. lg:focus[text-red-100])
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
