import { StyleObject } from "@tailwindcssinjs/transformers";

export function removeStyleObjectfallbacks(
  styleObject: StyleObject
): StyleObject {
  const rules = Object.entries(styleObject).map(([key, value]) => {
    if (typeof value === "string") {
      return [key, value];
    }
    if (Array.isArray(value)) {
      return [key, value.pop()];
    } else {
      return [key, removeStyleObjectfallbacks(value)];
    }
  });
  return Object.fromEntries(rules);
}
