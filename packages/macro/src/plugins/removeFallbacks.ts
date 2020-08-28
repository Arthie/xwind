import { StyleObject } from "@tailwindcssinjs/tailwindcss-data/lib/transformers";

export default function removeFallbacks(styleObject: StyleObject): StyleObject {
  const rules = Object.entries(styleObject).map(([key, value]) => {
    if (typeof value === "string") {
      return [key, value];
    }
    if (Array.isArray(value)) {
      return [key, value.pop()];
    } else {
      return [key, removeFallbacks(value)];
    }
  });
  return Object.fromEntries(rules);
}
