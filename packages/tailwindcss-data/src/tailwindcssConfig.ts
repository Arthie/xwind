import path from "path";
import fs from "fs";

export interface TailwindConfig {
  prefix?: string;
  important?: boolean;
  separator?: string;
  theme: Theme;
  variants: KeyConfig;
  corePlugins?: KeyConfig;
  plugins: string[];
}

interface KeyConfig {
  [key: string]: string | { [key: string]: string };
}

interface Theme {
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

export interface ResolvedTialwindConfig extends Required<TailwindConfig> {
  theme: Required<Theme>;
}

/**
 * returns resolved/absolute path of tailwind.config.js
 * @param configPath relative path to tailwind.config.js
 */
export function resolveTailwindConfigPath(configPath: string) {
  try {
    const resolvedConfigPath = path.resolve(configPath);
    fs.accessSync(resolvedConfigPath);
    return resolvedConfigPath;
  } catch (err) {
    throw new Error(`Tailwind config file not found '${configPath}' | ${err}`);
  }
}

/**
 * returns required tailwind.config.js
 * if no configPath parameter it will return default tailwind.config.js
 * @param configPath optional relative path to tailwind.config.js
 */
export function requireTailwindConfig(configPath?: string): TailwindConfig {
  try {
    const config = configPath
      ? require(configPath)
      : require("tailwindcss/defaultConfig");

    return config;
  } catch (err) {
    throw new Error(`Tailwind config file not found '${configPath}' | ${err}`);
  }
}
