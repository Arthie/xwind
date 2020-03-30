import "core-js/stable/array/flat";

export const twClassesComposer = (
  separator: string
) => {
  if (typeof separator !== "string") {
    throw new Error(`Separator "${separator}" must be of type String`);
  }

  const NOT_WHITE_SPACE_REGEXP = /\S+/g;
  const VARIANT_ARRAY_REGEXP = new RegExp(
    `\\S+(${separator}\\w+)?(\\[((.|\\n)*?)\\])`,
    "g"
  );

  const variantArrayReplacer = (match: string) => {
    const [variant, twClassesString] = match.replace("]", "").split("[")
    const twClasses = twClassesString.match(NOT_WHITE_SPACE_REGEXP)
    let replacements = []
    for (const twClass of twClasses ?? []) {
      replacements.push(`${variant}${separator}${twClass}`)
    }
    return replacements.join(" ")
  };

  return (...twClasses: Array<string | string[]>) => {
    if (!(twClasses instanceof Array)) {
      throw new Error(
        `Type of input ${twClasses} is invalid. Only Array of strings type is supported`
      );
    }

    const twClassesString = twClasses.flat(Infinity).join(" ")

    //replace variant arrays (e.g. lg:focus[text-red-100])
    const convertedClasses = twClassesString.replace(
      VARIANT_ARRAY_REGEXP,
      variantArrayReplacer
    );

    //remove whitespaces
    return convertedClasses.match(NOT_WHITE_SPACE_REGEXP) ?? [];
  }
};

export const twClassesSerializer = (
  separator: string
) => {
  const composer = twClassesComposer(separator)
  return (...twClasses: string[]) => composer(twClasses).join(" ");
}

export const twClassesVariantsParser = (
  separator: string
) => {
  const composer = twClassesComposer(separator)
  return (...twClasses: string[]) => {
    const parsedClassesVariants: Array<[string, string[]]> = [];
    const composedTwClasses = composer(twClasses);

    for (const composedTwClass of composedTwClasses) {
      const [twClass, ...variants] = composedTwClass.split(separator).reverse();
      parsedClassesVariants.push([twClass, variants]);
    }

    return parsedClassesVariants;
  }
};
