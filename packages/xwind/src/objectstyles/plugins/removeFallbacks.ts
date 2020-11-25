import { Objectstyle } from "@xwind/core/lib/utilities";

function removeFallbacks(objectstyle: Objectstyle): Objectstyle {
  const rules = Object.entries(objectstyle).map(([key, value]) => {
    if (typeof value === "string" || typeof value === "number") {
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

export default removeFallbacks;
