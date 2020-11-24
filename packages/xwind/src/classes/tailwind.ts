import core, {
  createTwClassDictionary,
  ResolvedTailwindConfig,
} from "@xwind/core";

import initTwClassesUtils, {
  TwClasses,
  TwParsedClass,
} from "@xwind/class-utilities";

function tailwind(
  tailwindConfig: ResolvedTailwindConfig,
  includeBase: boolean
) {
  const {
    resolvedConfig,
    utilitiesRoot,
    componentsRoot,
    baseRoot,
    screens,
    variants,
    generateTwClassSubstituteRoot,
  } = core(tailwindConfig);

  const twClassDictionary = {
    XWIND_BASE: createTwClassDictionary(baseRoot).XWIND_GLOBAL,
    ...createTwClassDictionary(componentsRoot, utilitiesRoot),
  };

  const variantOrder = tailwindConfig.variantOrder;
  const twClassOrder = Object.keys(twClassDictionary);
  const compare = (
    { class: firstClass, variants: firstVariants }: TwParsedClass,
    { class: secondClass, variants: secondVariants }: TwParsedClass
  ) => {
    //compare screen variants
    const firstScreenIndex = firstVariants.length
      ? screens.indexOf(firstVariants[firstVariants.length - 1])
      : -1;
    const secondScreenIndex = secondVariants.length
      ? screens.indexOf(secondVariants[secondVariants.length - 1])
      : -1;
    if (firstScreenIndex !== -1 || secondScreenIndex !== -1) {
      if (firstScreenIndex < secondScreenIndex) return -1;
      if (firstScreenIndex > secondScreenIndex) return 1;
    }

    //compare classes
    const firstClassIndex = twClassOrder.indexOf(firstClass);
    const secondClassIndex = twClassOrder.indexOf(secondClass);
    if (firstClassIndex < secondClassIndex) return -1;
    if (firstClassIndex > secondClassIndex) return 1;

    //compare variants
    const firstVariantsIndex = variantOrder.indexOf(firstVariants[0]);
    const secondVariantsIndex = variantOrder.indexOf(secondVariants[0]);
    if (firstVariantsIndex !== -1 || secondVariantsIndex !== -1) {
      if (firstVariantsIndex < secondVariantsIndex) return -1;
      if (firstVariantsIndex > secondVariantsIndex) return 1;
    }
    return 0;
  };

  const twClassesUtils = initTwClassesUtils(resolvedConfig.separator, [
    ...screens,
    ...variants,
  ]);

  const generatedTwClassesCSS: { [key: string]: string } = {};

  return (twClasses: TwClasses) => {
    const sortedTwClasses = twClassesUtils
      .parser(
        includeBase ? "XWIND_BASE XWIND_GLOBAL" : "XWIND_GLOBAL",
        twClasses
      )
      .sort(compare);
    const combinedRoot: string[] = [];

    for (const twClass of sortedTwClasses) {
      const [generatedTwClass] = twClassesUtils.generator(twClass);

      let generatedTwClassCSS = generatedTwClassesCSS[generatedTwClass];

      if (!generatedTwClassCSS) {
        generatedTwClassCSS = generateTwClassSubstituteRoot(
          twClassDictionary,
          twClass
        ).toString();
        generatedTwClassesCSS[generatedTwClass] = generatedTwClassCSS;
      }
      combinedRoot.push(generatedTwClassCSS);
    }

    const preText =
      "/*! Generated with xwind | https://github.com/arthie/xwind */";

    return [preText, ...combinedRoot].join("\n");
  };
}

export default tailwind;
