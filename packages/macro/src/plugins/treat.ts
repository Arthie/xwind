import {
  StyleObject,
  StyleObjectRuleOrAtRule,
} from "@tailwindcssinjs/transformers";
import removeFallbacks from "./removeFallbacks";

//TODO: wat about @print atrules ???
export default function treat(styleObject: StyleObject): StyleObject {
  const removedStyleObjectFallbacks = removeFallbacks(styleObject);
  const rulesMap = new Map(Object.entries(removedStyleObjectFallbacks));
  for (const [key, value] of new Map(
    Object.entries(removedStyleObjectFallbacks)
  )) {
    if (typeof value === "object" && !Array.isArray(value)) {
      if (key.startsWith("@media")) {
        const media = rulesMap.get("@media") as StyleObjectRuleOrAtRule;
        if (media) {
          rulesMap.set("@media", {
            ...media,
            [key.slice(6).trimStart()]: treat(value),
          });
        } else {
          rulesMap.set("@media", {
            [key.slice(6).trimStart()]: treat(value),
          });
        }
      } else {
        const selectors = rulesMap.get("selectors") as StyleObjectRuleOrAtRule;
        if (selectors) {
          rulesMap.set("selectors", {
            ...selectors,
            [key]: treat(value),
          });
        } else {
          rulesMap.set("selectors", {
            [key]: treat(value),
          });
        }
      }
      rulesMap.delete(key);
    }
  }
  return Object.fromEntries(rulesMap.entries());
}
