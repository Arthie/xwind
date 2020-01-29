export type TwClasses = TwClass[] | Set<TwClass>

export type TwClass = string | TwObject

export interface TwObject {
  [key: string]: string | { [key: string]: string }
}

const notWhitespace = /\S+/g

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

  for (const twClass of twClasses) {
    if (typeof twClass === "string") {
      const matchedTwClasses = twClass.match(notWhitespace)
      if (matchedTwClasses) composedTwClasses.push(...matchedTwClasses)
      continue
    }

    if (typeof twClass === "object" && !(twClass instanceof Array)) {
      const composedTwClassObject = twClassObjectComposer(twClass, separator)
      composedTwClasses.push(...composedTwClassObject)
      continue
    }

    throw new Error(`Input "${twClass}" is not supported`)
  }

  return composedTwClasses
}

export const twClassesMapParser = (twClasses: TwClasses, separator: string) => {
  const parsedMap = new Map<string, string[]>()

  const composedTwClasses = twClassesComposer(twClasses, separator)

  for (const composedTwClass of composedTwClasses) {
    const [twClass, ...variants] = composedTwClass.split(separator).reverse()
    parsedMap.set(twClass, variants)
  }

  return parsedMap
}

export const twClassesSerializer = (twClasses: TwClasses, separator: string) =>
  twClassesComposer(twClasses, separator).join(" ")

type TagFunction = (twClasses: TwClasses, separator: string) => any

//Note: Tags do not follow input order, inputs will be ordered by type: first strings then objects
const twClassTagFactory = <T extends TagFunction>(twClassFunction: T) => (
  separator: string
) => (
  twClassestrings: string[] | TemplateStringsArray,
  ...twClassObjects: TwObject[]
): T => twClassFunction([...twClassestrings, ...twClassObjects], separator)

export const twClassesComposerTag = twClassTagFactory(twClassesComposer)

export const twClassesSerializerTag = twClassTagFactory(twClassesSerializer)

export const twClassesMapParserTag = twClassTagFactory(twClassesMapParser)
