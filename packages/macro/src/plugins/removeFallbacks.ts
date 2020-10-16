import { ObjectStyle } from "../../../tailwindcss-data/lib/utilities";

export default function removeFallbacks(objectStyle: ObjectStyle): ObjectStyle {
  const rules = Object.entries(objectStyle).map(([key, value]) => {
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
