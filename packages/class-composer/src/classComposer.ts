import isPlainObject from "lodash/isPlainObject";
import "core-js/stable/array/flat";

export type TwClass = string | TwObject;

export interface TwObject {
  [key: string]: string | { [key: string]: string };
}

const twClassObjectComposer = (twClass: TwObject, separator: string) => {
  const composedTwClassObject: string[] = [];
  for (const twVariant in twClass) {
    const twClasses = twClassesComposerFunction(
      [twClass[twVariant]],
      separator
    );

    const twVariantClasses = twClasses.map(
      (value: string) => `${twVariant}${separator}${value}`
    );

    composedTwClassObject.push(...twVariantClasses);
  }
  return composedTwClassObject;
};

export const twClassesComposerFunction = (
  twClasses: TwClass[],
  separator: string
) => {
  if (!(twClasses instanceof Array)) {
    throw new Error(
      `Type of input ${twClasses} is invalid. Only Array type is supported`
    );
  }

  if (!(typeof separator === "string")) {
    throw new Error(`Separator "${separator}" must be of type String`);
  }

  const composedTwClasses: string[] = [];
  const NOT_WHITE_SPACE_REGEXP = /\S+/g;

  //flatten the array to make arrays possible as input
  for (const twClass of twClasses.flat() as TwClass[]) {
    if (typeof twClass === "string") {
      const matchedTwClasses = twClass.match(NOT_WHITE_SPACE_REGEXP);
      if (matchedTwClasses) {
        composedTwClasses.push(...matchedTwClasses);
      }
      continue;
    }

    if (isPlainObject(twClass)) {
      const composedTwClassObject = twClassObjectComposer(twClass, separator);
      composedTwClasses.push(...composedTwClassObject);
      continue;
    }

    throw new Error(`Input "${twClass}" is not supported`);
  }

  return composedTwClasses;
};

export const twClassesSerializerFunction = (
  twClasses: TwClass[],
  separator: string
) => twClassesComposerFunction(twClasses, separator).join(" ");

export const twClassesVariantsParserFunction = (
  twClasses: TwClass[],
  separator: string
) => {
  const parsedClassesVariants: Array<[string, string[]]> = [];

  const composedTwClasses = twClassesComposerFunction(twClasses, separator);

  for (const composedTwClass of composedTwClasses) {
    const [twClass, ...variants] = composedTwClass.split(separator).reverse();
    parsedClassesVariants.push([twClass, variants]);
  }

  return parsedClassesVariants;
};

type TwClassesFunction = (twClasses: TwClass[], separator: string) => any;

const twClassTagFactory = <T extends TwClassesFunction>(twClassFunction: T) => (
  separator: string
) => (
  twClassTemplateStrings: TemplateStringsArray,
  ...twClassObjects: TwObject[]
): T => {
    //This code makes sure that input order is kept
    const twClassStrings = [...twClassTemplateStrings];
    const twClasses: TwClass[] = [];
    while (twClassStrings.length || twClassObjects.length) {
      const twClassString = twClassStrings.shift();
      const twClassObject = twClassObjects.shift();
      if (twClassString) {
        twClasses.push(twClassString);
      }
      if (twClassObject) {
        twClasses.push(twClassObject);
      }
    }

    return twClassFunction(twClasses, separator);
  };

export const twClassesComposerTag = twClassTagFactory(
  twClassesComposerFunction
);

export const twClassesSerializerTag = twClassTagFactory(
  twClassesSerializerFunction
);

export const twClassesVariantsParserTag = twClassTagFactory(
  twClassesVariantsParserFunction
);

const twClassFunctionTagFactory = (twClassesFunction: TwClassesFunction) => (
  separator: string
) => (...args: TwClass[] | [TemplateStringsArray, ...TwObject[]]) => {
  const [arg1, ...rest] = args;

  if (!(typeof arg1 === "string")) {
    const isTag = !!(
      arg1 &&
      arg1.length > 0 &&
      arg1.raw &&
      arg1.raw.length === arg1.length &&
      Object.isFrozen(arg1) &&
      rest.length + 1 === arg1.length
    );

    if (isTag) {
      return twClassTagFactory(twClassesFunction)(separator)(
        arg1 as TemplateStringsArray,
        ...(rest as TwObject[])
      );
    }
  }

  return twClassesFunction(args as TwClass[], separator);
};

export const twClassesComposer = twClassFunctionTagFactory(
  twClassesComposerFunction
);
export const twClassesSerializer = twClassFunctionTagFactory(
  twClassesSerializerFunction
);
export const twClassesVariantsParser = twClassFunctionTagFactory(
  twClassesVariantsParserFunction
);
