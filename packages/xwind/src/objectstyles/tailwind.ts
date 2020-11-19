import {
  createTwClassDictionary,
  tailwindData,
  ResolvedTailwindConfig,
  transformTwRootToObjectStyle,
  mergeObjectStyles,
  ObjectStyle,
} from "@xwind/core";

import initTwClassesUtils, { TwClasses } from "@xwind/class-utilities";

function tailwind(tailwindConfig: ResolvedTailwindConfig) {
  const {
    resolvedConfig,
    utilitiesRoot,
    componentsRoot,
    screens,
    variants,
    generateTwClassSubstituteRoot,
  } = tailwindData(tailwindConfig);

  const twClassDictionary = createTwClassDictionary(
    componentsRoot,
    utilitiesRoot
  );

  const twClassesUtils = initTwClassesUtils(resolvedConfig.separator, [
    ...screens,
    ...variants,
  ]);

  return (twClasses: TwClasses) => {
    const parsedTwClasses = twClassesUtils.parser(twClasses);
    const composedTwClasses = twClassesUtils.composer(twClasses);

    const objectStyles: ObjectStyle[] = [];
    for (const parsedTwClass of parsedTwClasses) {
      const twRoot = generateTwClassSubstituteRoot(
        twClassDictionary,
        parsedTwClass
      );
      objectStyles.push(transformTwRootToObjectStyle(parsedTwClass[0], twRoot));
    }

    let objectStyle = mergeObjectStyles(objectStyles);

    if (resolvedConfig.xwind?.objectstyles?.plugins) {
      for (const plugin of resolvedConfig.xwind.objectstyles.plugins) {
        objectStyle = plugin(objectStyle, composedTwClasses, resolvedConfig);
      }
    }

    return objectStyle;
  };
}

export default tailwind;
