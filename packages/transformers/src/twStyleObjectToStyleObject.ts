import merge from "lodash/merge";
import "core-js/stable/object/from-entries";

import { TwCssObject, AtRule, Rule, StyleObject } from "./transformersTypes";

const getPseudoClass = (pseudoPrefix: string, classPrefix: string) => {
  switch (pseudoPrefix) {
    case "first":
      return "&:first-child";
    case "last":
      return "&:last-child";
    case "odd":
      return "&:nth-child(odd)";
    case "even":
      return "&:nth-child(even)";
    case "group-hover":
      return `.${classPrefix}group:hover &`;
    default:
      //#other PseuldoClasses:
      //hover
      //focus
      //active
      //disabled
      //visited
      //focus-within
      return `&:${pseudoPrefix}`;
  }
};

export const applyVariants = (
  twCssObject: TwCssObject,
  variants: string[],
  mediaScreens: {
    [key: string]: string;
  },
  classPrefix: string,
  strict: boolean
) => {
  let variantTwCssObject = twCssObject.cssObject;

  for (const variant of variants) {
    if (
      twCssObject.variants?.includes("responsive") &&
      Object.keys(mediaScreens).includes(variant)
    ) {
      variantTwCssObject = {
        [`@media ${mediaScreens[variant]}`]: variantTwCssObject,
      } as AtRule;
      continue;
    }

    if (twCssObject.variants?.includes(variant) || !strict) {
      const pseudoClass = getPseudoClass(variant, classPrefix);
      variantTwCssObject = ({
        [pseudoClass]: variantTwCssObject,
      } as unknown) as Rule;
      continue;
    }

    throw new Error(
      `Utilitie with pseudo class '${variant}' not found, add variant to "tailwind.config.js"`
    );
  }

  return variantTwCssObject;
};

const getMediaScreenIndex = (
  mediaScreens: {
    [key: string]: string;
  },
  mediaValue: string
) => {
  const mediaScreenValues = Object.values(mediaScreens);
  const mediaScreenIndex = mediaScreenValues.findIndex(
    (mediaScreen) => `@media ${mediaScreen}` === mediaValue
  );
  return mediaScreenIndex;
};

export const sortStyleObject = (
  cssObject: [string, string | Rule | AtRule][],
  mediaScreens: {
    [key: string]: string;
  }
) =>
  cssObject.sort(([first, firstValue], [second, secondValue]) => {
    const firstValueType = typeof firstValue;
    const secondValueType = typeof secondValue;

    if ([firstValueType, secondValueType].includes("string")) {
      if (firstValueType === "string" && secondValueType === "string") {
        const firstIsCssVar = first.startsWith("--")
        const secondIsCssVar = second.startsWith("--")
        if (firstIsCssVar && secondIsCssVar) return 0
        if (firstIsCssVar) return -1
        if (secondIsCssVar) return 1

        return 0;
      }

      if (firstValueType === "string") return -1;
      if (secondValueType === "string") return 1;
    }

    const firstIsMedia = first.startsWith("@media");
    const secondIsMedia = second.startsWith("@media");

    if (firstIsMedia || secondIsMedia) {
      if (firstIsMedia && secondIsMedia) {
        const firstIndex = getMediaScreenIndex(mediaScreens, first);
        const secondIndex = getMediaScreenIndex(mediaScreens, second);
        if (firstIndex > secondIndex) return 1;
        if (firstIndex < secondIndex) return -1;
      }

      if (firstIsMedia) return 1;
      if (secondIsMedia) return -1;
    }

    return 0;
  });

export const transformTwStyleObjectToStyleObject = (
  components: Map<string, TwCssObject>,
  twParsedClasses: Array<[string, string[]]>,
  mediaScreens: {
    [key: string]: string;
  },
  classPrefix: string,
  strict: boolean
) => {
  const cssObjectArray: StyleObject[] = [];

  twParsedClasses.forEach(([twClass, variants]) => {
    const twCssObject = components.get(twClass);
    if (twCssObject) {
      if (variants.length === 0) {
        cssObjectArray.push(twCssObject.cssObject);
      } else {
        cssObjectArray.push(
          applyVariants(
            twCssObject,
            variants,
            mediaScreens,
            classPrefix,
            strict
          )
        );
      }
    } else {
      throw new Error(`Utilitie with class '${twClass}' not found`);
    }
  });

  const mergedCssObject: StyleObject = merge({}, ...cssObjectArray);

  const sortedStyleObject = sortStyleObject(
    Object.entries(mergedCssObject),
    mediaScreens
  );

  const sortedMediaQuerries = sortedStyleObject.map((item) => {
    const [name, rule] = item;
    if (name.startsWith("@media") && typeof rule !== "string") {
      return [
        name,
        Object.fromEntries(sortStyleObject(Object.entries(rule), mediaScreens)),
      ];
    }
    return item;
  });

  return Object.fromEntries(sortedMediaQuerries);
};
