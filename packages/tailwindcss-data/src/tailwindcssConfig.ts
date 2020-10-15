import path from "path";
import fs from "fs";

export interface TailwindConfig {
  separator?: string;
  [key: string]: any;
}

export interface ResolvedTailwindConfig {
  separator: string;
  [key: string]: any;
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
