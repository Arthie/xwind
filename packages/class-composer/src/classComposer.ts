import isPlainObject from "lodash/isPlainObject"

export type TwClasses = TwClass[] | Set<TwClass>

export type TwClass = string | TwObject

export interface TwObject {
  [key: string]: string | { [key: string]: string }
}

const twClassObjectComposer = (twClass: TwObject, separator: string) => {
  const composedTwClassObject: string[] = []
  for (const twVariant in twClass) {
    const twClasses = twClassesComposer([twClass[twVariant]], separator)

    const twVariantClasses = twClasses.map(
      (value: string) => `${twVariant}${separator}${value}`
    )

    composedTwClassObject.push(...twVariantClasses)
  }
  return composedTwClassObject
}

export const twClassesComposer = (twClasses: TwClasses, separator: string) => {
  if (!(twClasses instanceof Array) && !(twClasses instanceof Set)) {
    throw new Error(
      `Type of input ${twClasses} is invalid. Only Array and Set types are supported`
    )
  }

  if (!(typeof separator === "string")) {
    throw new Error(`Separator "${separator}" must be of type String`)
  }

  const composedTwClasses: string[] = []
  const NOT_WHITE_SPACE_REGEXP = /\S+/g

  for (const twClass of twClasses) {
    if (typeof twClass === "string") {
      const matchedTwClasses = twClass.match(NOT_WHITE_SPACE_REGEXP)
      if (matchedTwClasses) {
        composedTwClasses.push(...matchedTwClasses)
      }
      continue
    }

    if (isPlainObject(twClass)) {
      const composedTwClassObject = twClassObjectComposer(twClass, separator)
      composedTwClasses.push(...composedTwClassObject)
      continue
    }

    throw new Error(`Input "${twClass}" is not supported`)
  }

  return composedTwClasses
}

export const twClassesVariantsParser = (
  twClasses: TwClasses,
  separator: string
) => {
  const parsedClassesVariants: Array<[string, string[]]> = []

  const composedTwClasses = twClassesComposer(twClasses, separator)

  for (const composedTwClass of composedTwClasses) {
    const [twClass, ...variants] = composedTwClass.split(separator).reverse()
    parsedClassesVariants.push([twClass, variants])
  }

  return parsedClassesVariants
}

export const twClassesSerializer = (twClasses: TwClasses, separator: string) =>
  twClassesComposer(twClasses, separator).join(" ")

type TagFunction = (twClasses: TwClasses, separator: string) => any

const twClassTagFactory = <T extends TagFunction>(twClassFunction: T) => (
  separator: string
) => (
  twClassTemplateStrings: TemplateStringsArray,
  ...twClassObjects: TwObject[]
): T => {
  //This code makes sure that input order is kept
  const twClassStrings = [...twClassTemplateStrings]
  const twClasses: TwClasses = []
  while (twClassStrings.length || twClassObjects.length) {
    const twClassString = twClassStrings.shift()
    const twClassObject = twClassObjects.shift()
    if (twClassString) {
      twClasses.push(twClassString)
    }
    if (twClassObject) {
      twClasses.push(twClassObject)
    }
  }

  return twClassFunction(twClasses, separator)
}

export const twClassesComposerTag = twClassTagFactory(twClassesComposer)

export const twClassesSerializerTag = twClassTagFactory(twClassesSerializer)

export const twClassesVariantsParserTag = twClassTagFactory(
  twClassesVariantsParser
)
