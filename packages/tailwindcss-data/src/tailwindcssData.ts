import path from "path";
import fs from "fs";
import postcss from "postcss";
import "core-js/stable/object/from-entries";

import resolveConfig from "tailwindcss/resolveConfig";
import buildMediaQuery from "tailwindcss/lib/util/buildMediaQuery";
import substituteVariantsAtRules from "tailwindcss/lib/lib/substituteVariantsAtRules";
import corePlugins from "tailwindcss/lib/corePlugins";
import processPlugins from "tailwindcss/lib/util/processPlugins";
import defaultConfig from "tailwindcss/defaultConfig";

export const DEFAULT_CONFIG_PATH = "./tailwind.config.js";

export interface TailwindConfig {
  prefix?: string;
  important?: boolean;
  separator?: string;
  theme: Theme;
  variants: KeyConfig;
  corePlugins?: KeyConfig;
  plugins: string[];
}

export interface KeyConfig {
  [key: string]: string | { [key: string]: string };
}

export interface Theme {
  extend?: Theme;
  screens?: KeyConfig;
  colors?: KeyConfig;
  spacing?: KeyConfig;
  backgroundPosition?: KeyConfig;
  backgroundSize?: KeyConfig;
  borderRadius?: KeyConfig;
  borderWidth?: KeyConfig;
  boxShadow?: KeyConfig;
  container?: KeyConfig;
  cursor?: KeyConfig;
  fill?: KeyConfig;
  flex?: KeyConfig;
  flexGrow?: KeyConfig;
  flexShrink?: KeyConfig;
  fontFamily?: KeyConfig;
  fontSize?: KeyConfig;
  fontWeight?: KeyConfig;
  inset?: KeyConfig;
  letterSpacing?: KeyConfig;
  lineHeight?: KeyConfig;
  listStyleType?: KeyConfig;
  maxHeight?: KeyConfig;
  minHeight?: KeyConfig;
  minWidth?: KeyConfig;
  objectPosition?: KeyConfig;
  opacity?: KeyConfig;
  order?: KeyConfig;
  stroke?: KeyConfig;
  strokeWidth?: KeyConfig;
  zIndex?: KeyConfig;
  rowGap?: KeyConfig;
  columnGap?: KeyConfig;
  gridTemplateColumns?: KeyConfig;
  gridColumn?: KeyConfig;
  gridColumnStart?: KeyConfig;
  gridColumnEnd?: KeyConfig;
  gridTemplateRows?: KeyConfig;
  gridRow?: KeyConfig;
  gridRowStart?: KeyConfig;
  gridRowEnd?: KeyConfig;
  transformOrigin?: KeyConfig;
  scale?: KeyConfig;
  rotate?: KeyConfig;
  skew?: KeyConfig;
  transitionProperty?: KeyConfig;
  transitionTimingFunction?: KeyConfig;
  transitionDuration?: KeyConfig;
}

interface ResolvedTialwindConfig extends Required<TailwindConfig> {
  theme: Required<Theme>;
}

const resolveTailwindConfigPath = (configPath?: string) => {
  const filePath = configPath ?? DEFAULT_CONFIG_PATH;
  try {
    const defaultConfigPath = path.resolve(filePath);
    fs.accessSync(defaultConfigPath);
    return defaultConfigPath;
  } catch (err) {
    throw new Error(`File not found '${filePath}' | ${err}`);
  }
};

export const resolveTailwindConfig = (configFile?: string): TailwindConfig => {
  try {
    const configPath = resolveTailwindConfigPath(configFile);
    const config = require(configPath);
    return config;
  } catch (err) {
    return defaultConfig;
  }
};

export const getMediaScreens = (config: ResolvedTialwindConfig) => {
  const screens = Object.entries(config.theme.screens);
  const buildScreens = screens.map(([key, value]): [string, string] => [
    key,
    buildMediaQuery(value),
  ]);
  return Object.fromEntries(buildScreens);
};

export const getVariants = (variantGenerators: any) =>
  [
    "default",
    "group-hover",
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

export const applyVariant = (
  variantGenerators: any,
  config: TailwindConfig
) => (variant: string, decals: string) => {
  const root = postcss.parse(`@variants ${variant} {.Arthie {
    ${decals}
  }}`);

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

export const processTailwindPlugins = (config: ResolvedTialwindConfig) => {
  const processedPlugins = processPlugins(
    [...corePlugins(config), ...config.plugins],
    config
  );

  return {
    variantGenerators: processedPlugins.variantGenerators,
    baseRoot: postcss.root({ nodes: processedPlugins.base }),
    utilitiesRoot: postcss.root({ nodes: processedPlugins.utilities }),
    componentsRoot: postcss.root({ nodes: processedPlugins.components }),
  };
};

export const tailwindData = (config: TailwindConfig) => {
  const resolvedConfig = resolveConfig(config) as ResolvedTialwindConfig;
  const mediaScreens = getMediaScreens(resolvedConfig);

  const {
    utilitiesRoot,
    componentsRoot,
    baseRoot,
    variantGenerators,
  } = processTailwindPlugins(resolvedConfig);

  const variants = getVariants(variantGenerators);

  return {
    resolvedConfig,
    componentsRoot,
    utilitiesRoot,
    baseRoot,
    mediaScreens,
    variants,
    applyVariant: applyVariant(variantGenerators, resolvedConfig),
  };
};
