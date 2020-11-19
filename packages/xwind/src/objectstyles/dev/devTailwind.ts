import {
  createTwClassDictionary,
  tailwindData,
  ResolvedTailwindConfig,
  transformTwRootToObjectStyle,
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

    const objectStyles: [string, ObjectStyle][] = [];
    for (const parsedTwClass of parsedTwClasses) {
      const twRoot = generateTwClassSubstituteRoot(
        twClassDictionary,
        parsedTwClass
      );
      const [twClass] = twClassesUtils.generator([parsedTwClass]);
      objectStyles.push([
        twClass,
        transformTwRootToObjectStyle(parsedTwClass[0], twRoot),
      ]);
    }

    return objectStyles;
  };
}

export default tailwind;
