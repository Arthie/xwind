export type TwClassName = string | TwObject

export interface TwObject {
  [key: string]: string | { [key: string]: string }
}

const twClassNameObjectComposer = (
  twClassName: TwObject,
  separator: string
) => {
  let composedTwClassNameObject = []
  for (const twVariant in twClassName) {
    const twClassNames = twClassNameComposer(
      [twClassName[twVariant]],
      separator
    )

    const twVariantClassNames = twClassNames.map(
      (value: string) => `${twVariant}${separator}${value}`
    )

    composedTwClassNameObject.push(...twVariantClassNames)
  }
  return composedTwClassNameObject
}

export const twClassNameComposer = (
  twClassNames: TwClassName[],
  separator: string
) => {
  const composedTwClassNames: string[] = []
  for (const twClassName of twClassNames) {
    if (typeof twClassName === "string") {
      composedTwClassNames.push(...twClassName.split(" "))
    } else {
      const composedTwClassNameObject = twClassNameObjectComposer(
        twClassName,
        separator
      )
      composedTwClassNames.push(...composedTwClassNameObject)
    }
  }

  return composedTwClassNames
}

export const twClassNameSerializer = (
  twClassNames: TwClassName[],
  separator: string
) => twClassNameComposer(twClassNames, separator).join(" ")

export const twClassNameMapParser = (
  twClassNames: TwClassName[],
  separator: string
) => {
  const parsedMap = new Map<string, string[]>()

  const composedTwClassNames = twClassNameComposer(twClassNames, separator)

  for (const composedTwClassName of composedTwClassNames) {
    const [className, ...variants] = composedTwClassName
      .split(separator)
      .reverse()
    parsedMap.set(className, variants)
  }

  return parsedMap
}
