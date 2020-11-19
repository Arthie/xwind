import { TailwindConfig } from "@xwind/core";
import { mergeObjectStyles, ObjectStyle } from "@xwind/core/lib/utilities";

function devMergeObjectstyles(
  tailwindConfig: TailwindConfig,
  composedTwClasses: string[],
  ...objectstyles: ObjectStyle[]
) {
  let objectStyle = mergeObjectStyles(objectstyles);
  if (tailwindConfig.xwind?.objectstyles?.plugins) {
    for (const plugin of tailwindConfig.xwind.objectstyles.plugins) {
      objectStyle = plugin(objectStyle, composedTwClasses, tailwindConfig);
    }
  }
  return objectStyle;
}

export default devMergeObjectstyles;
