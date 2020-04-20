import merge from "lodash/merge";
//@ts-ignore
const timsort = require("timsort");
import "core-js/stable/object/from-entries";

import { TwStyleObject, AtRule, Rule, StyleObject } from "./transformersTypes";
import { transformStyleObjectToCssString } from "./styleObjectToCssString";
import { Rule as PostCSSRule } from "postcss";
//@ts-ignore
import objectify from "./postcssjs-objectify";

export const applyTwClassVariants = (
  twClass: string,
  twVariants: string[],
  twStyleObject: TwStyleObject,
  mediaScreens: {
    [key: string]: string;
  },
  variants: string[],
  applyVariant: (variant: string, decals: string) => PostCSSRule
) => {
  if (twStyleObject.type !== "utility") {
    throw new Error(
      `Variant class "${twVariants.join(
        ", "
      )}" not allowed with class "${twClass}" of type "${twStyleObject.type}"`
    );
  }

  let variantStyleObject = twStyleObject.styleObject;

  for (const variant of twVariants) {
    if (
      //@ts-ignore
      twStyleObject.variants.includes("responsive") &&
      Object.keys(mediaScreens).includes(variant)
    ) {
      variantStyleObject = {
        [`@media ${mediaScreens[variant]}`]: variantStyleObject,
      } as AtRule;
      continue;
    }

    if (variants.includes(variant)) {
      const decals = transformStyleObjectToCssString(variantStyleObject);
      const variantRule = applyVariant(variant, decals);

      variantStyleObject = {
        [variantRule.selector]: objectify(variantRule),
      };

      if (variantRule.parent.type === "atrule") {
        const media = `@${variantRule.parent.name} ${variantRule.parent.params}`;
        variantStyleObject = {
          [media]: variantStyleObject as AtRule,
        };
      }
      continue;
    }

    throw new Error(
      `Utility with variant class '${variant}' not found, add variant to "tailwind.config.js"`
    );
  }

  return variantStyleObject;
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
  styleObject: [string, string | Rule | AtRule][],
  mediaScreens: {
    [key: string]: string;
  }
): [string, string | Rule | AtRule][] => {
  //@ts-ignore
  timsort.sort(styleObject, ([first, firstValue], [second, secondValue]) => {
    const firstValueType = typeof firstValue;
    const secondValueType = typeof secondValue;

    if ([firstValueType, secondValueType].includes("string")) {
      if (firstValueType === "string" && secondValueType === "string") {
        //move css-variables to the top
        const firstIsCssVar = first.startsWith("--");
        const secondIsCssVar = second.startsWith("--");
        if (firstIsCssVar && secondIsCssVar) return 0;
        if (firstIsCssVar) return -1;
        if (secondIsCssVar) return 1;

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

  return styleObject;
};

export const transformTwStyleObjectToStyleObject = (
  twStyleObjectMap: Map<string, TwStyleObject>,
  twParsedClasses: [string, string[]][],
  mediaScreens: {
    [key: string]: string;
  },
  variants: string[],
  applyVariant: (variant: string, decals: string) => PostCSSRule
) => {
  const styleObjectArray: StyleObject[] = [];

  twParsedClasses.forEach(([twClass, twClassVariants]) => {
    const twStyleObject = twStyleObjectMap.get(twClass);
    if (twStyleObject) {
      if (twClassVariants.length === 0) {
        styleObjectArray.push(twStyleObject.styleObject);
      } else {
        styleObjectArray.push(
          applyTwClassVariants(
            twClass,
            twClassVariants,
            twStyleObject,
            mediaScreens,
            variants,
            applyVariant
          )
        );
      }
    } else {
      throw new Error(
        `Class "${twClass}" not found. Check Tailwind config. Restart dev server and or clearing babel cache after Tailwind config changes.`
      );
    }
  });

  const mergedCssObject: StyleObject = merge({}, ...styleObjectArray);

  const sortedStyleObject = sortStyleObject(
    Object.entries(mergedCssObject),
    mediaScreens
  );

  //todo: fix & selector sorting in media queries
  const sortedMediaQuerries = sortedStyleObject.map((item) => {
    const [name, rule] = item;
    if (
      (name.startsWith("@media") || name.startsWith("&")) &&
      typeof rule !== "string"
    ) {
      return [
        name,
        Object.fromEntries(sortStyleObject(Object.entries(rule), mediaScreens)),
      ];
    }
    return item;
  });

  return Object.fromEntries(sortedMediaQuerries);
};
