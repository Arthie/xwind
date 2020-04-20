import merge from "lodash/merge";
import { TwObject, Rule, AtRule, TwStyleObject } from "./transformersTypes";
import { parse, stringify } from "css-what";

export const parseSelector = (selector: string) => {
  const [classSelector, ...otherSelectors] = parse(selector)[0];
  if (classSelector.type !== "attribute") {
    throw new Error(
      `Class selector not found in:"${selector}", the first element of the selector should be a class atrribute`
    );
  }
  return {
    selector: stringify([[classSelector, ...otherSelectors]]),
    class: classSelector.value,
    remainder: stringify([[...otherSelectors]]),
  };
};

const transformTwObjectToTwStyleObject = (twObject: TwObject) => {
  const { selector, decls, atRule, variants, type } = twObject;

  const selectors = parseSelector(selector);
  const twStyleObject: TwStyleObject = {
    styleObject: decls,
    type,
    selectors,
  };

  const selectorRemainder = selectors.remainder;
  if (selectorRemainder) {
    const styleObject = twStyleObject.styleObject as Rule;
    twStyleObject.styleObject = { [`&${selectorRemainder}`]: styleObject };
  }

  if (atRule) {
    const styleObject = twStyleObject.styleObject as AtRule;
    twStyleObject.styleObject = { [atRule]: styleObject };
  }

  if (variants) {
    twStyleObject.variants = variants;
  }

  return twStyleObject;
};

export const transformTwObjectsToTwStyleObjectMap = (twObjects: TwObject[]) => {
  const mappedObject = new Map<string, TwStyleObject>();
  for (const twObject of twObjects) {
    const { class: twClass } = parseSelector(twObject.selector);
    const styleObject = transformTwObjectToTwStyleObject(twObject);
    if (mappedObject.has(twClass)) {
      mappedObject.set(twClass, merge(mappedObject.get(twClass), styleObject));
    } else {
      mappedObject.set(twClass, styleObject);
    }
  }
  return mappedObject;
};
