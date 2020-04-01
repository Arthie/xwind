import merge from "lodash/merge";
import { TwObject, Rule, AtRule, TwStyleObject } from "./transformersTypes";

const SELECTOR_REGXEX = /[:]{1,2}\S*$/;
const BACKSLASH_REGXEX = /\\/g

export const parseSelector = (selector: string) => {
  const [pseudoSelector] = selector.match(SELECTOR_REGXEX) || [null];
  const twClassSelector = pseudoSelector
    ? selector.replace(pseudoSelector, "")
    : selector;

  //substring removes first .
  //replace fixes classnames / like "w-1\\/2" => "w-1/2"
  const twClass = twClassSelector.substring(1).replace(BACKSLASH_REGXEX, "");
  return {
    selector,
    pseudoSelector,
    twClass,
  };
};

const transformTwObjectToTwStyleObject = (twObject: TwObject) => {
  const { selector, decls, atRule, variants, type } = twObject;

  const twStyleObject: TwStyleObject = {
    styleObject: decls,
    type
  };

  const pseudoClass = parseSelector(selector).pseudoSelector;
  if (pseudoClass) {
    const styleObject = twStyleObject.styleObject as Rule;
    twStyleObject.styleObject = { [`&${pseudoClass}`]: styleObject };
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
    const { twClass } = parseSelector(twObject.selector);
    const styleObject = transformTwObjectToTwStyleObject(twObject);
    if (mappedObject.has(twClass)) {
      mappedObject.set(twClass, merge(mappedObject.get(twClass), styleObject));
    } else {
      mappedObject.set(twClass, styleObject);
    }
  }
  return mappedObject;
};
