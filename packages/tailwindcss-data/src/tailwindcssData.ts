import postcss from "postcss";
import "core-js/stable/object/from-entries";

//Tailwindcss imports
import buildMediaQuery from "tailwindcss/lib/util/buildMediaQuery";
import substituteVariantsAtRules from "tailwindcss/lib/lib/substituteVariantsAtRules";
import processPlugins from "tailwindcss/lib/util/processPlugins";

import { TailwindConfig, ResolvedTialwindConfig } from "./tailwindcssConfig";

export function getMediaScreens(config: ResolvedTialwindConfig) {
  const screens = Object.entries(config.theme.screens);
  const buildScreens = screens.map(([key, value]): [string, string] => [
    key,
    buildMediaQuery(value),
  ]);
  return Object.fromEntries(buildScreens);
}

export function getVariants(variantGenerators: any) {
  return [
    "default",
    "group-hover",
    "group-focus",
    "hover",
    "focus-within",
    "focus",
    "active",
    "visited",
    "disabled",
    "first",
    "last",
    "odd",
    "even",
  ].concat(Object.keys(variantGenerators));
}

//applyVariants for all classes
//add responsive and remove media builder???
//change to postcss-js???
export function getApplyVariant(
  variantGenerators: any,
  config: TailwindConfig
) {
  return (variant: string, decals: string) => {
    const root = postcss.parse(
      `@variants ${variant} {.Arthie {
    ${decals}
  }}`,
      { from: undefined }
    );

    substituteVariantsAtRules(config, { variantGenerators })(root);

    //todo: move to transformers ???
    let variantRule: postcss.Rule;
    root.walkRules((rule) => {
      if (rule.selector === ".Arthie") {
        rule.remove();
      } else {
        rule.selector = rule.selector.replace(/\S*(Arthie)/g, "&");
        variantRule = rule;
      }
    });

    //@ts-ignore
    return variantRule;
  };
}

export function processTailwindPlugins(
  config: ResolvedTialwindConfig,
  corePlugins: any
) {
  const processedPlugins = processPlugins(
    [...corePlugins, ...config.plugins],
    config
  );

  return {
    variantGenerators: processedPlugins.variantGenerators,
    baseRoot: postcss.root({ nodes: processedPlugins.base }),
    utilitiesRoot: postcss.root({ nodes: processedPlugins.utilities }),
    componentsRoot: postcss.root({ nodes: processedPlugins.components }),
  };
}

export function tailwindData(
  resolvedConfig: ResolvedTialwindConfig,
  corePlugins: any
) {
  const {
    utilitiesRoot,
    componentsRoot,
    baseRoot,
    variantGenerators,
  } = processTailwindPlugins(resolvedConfig, corePlugins);

  const mediaScreens = getMediaScreens(resolvedConfig);
  const variants = getVariants(variantGenerators);
  const applyVariant = getApplyVariant(variantGenerators, resolvedConfig);

  return {
    resolvedConfig,
    componentsRoot,
    utilitiesRoot,
    baseRoot,
    mediaScreens,
    variants,
    applyVariant,
    variantGenerators,
  };
}
