import path from "path"
import fs from "fs"
import postcss from "postcss"

import resolveConfig from "tailwindcss/resolveConfig"
import buildMediaQuery from "tailwindcss/lib/util/buildMediaQuery"
import corePlugins from "tailwindcss/lib/corePlugins"
import processPlugins from "tailwindcss/lib/util/processPlugins"
import defaultConfig from "tailwindcss/defaultConfig"

export const DEFAULT_CONFIG_PATH = "./tailwind.config.js"

export interface TailwindConfig {
  theme: {
    [key: string]: any
    screens: {
      [key: string]: any
    }
  }
  variants: {
    [key: string]: any
  }
  prefix: string | ""
  important: boolean
  separator: string | ":"
  corePlugins: {}
  plugins: []
}

const resolveTailwindConfigPath = (configPath?: string) => {
  const filePath = configPath ?? DEFAULT_CONFIG_PATH
  try {
    const defaultConfigPath = path.resolve(filePath)
    fs.accessSync(defaultConfigPath)
    return defaultConfigPath
  } catch (err) {
    throw new Error(`Could not find '${filePath}' | ${err}`)
  }
}

export const resolveTailwindConfig = (configFile?: string): TailwindConfig => {
  try {
    const configPath = resolveTailwindConfigPath(configFile)
    const config = require(configPath)
    return config
  } catch (err) {
    return defaultConfig
  }
}

export const getMediaScreens = (config: TailwindConfig) => {
  const screens = Object.entries(config.theme.screens)
  const buildScreens = screens.map(([key, value]): [string, string] => [
    key,
    buildMediaQuery(value)
  ])
  return Object.fromEntries(buildScreens)
}

export const processTailwindPlugins = (config: TailwindConfig) => {
  const processedPlugins = processPlugins(
    [...corePlugins(config), ...config.plugins],
    config
  )

  return {
    baseRoot: postcss.root({ nodes: processedPlugins.base }),
    utilitiesRoot: postcss.root({ nodes: processedPlugins.utilities }),
    componentsRoot: postcss.root({ nodes: processedPlugins.components })
  }
}

export const tailwindData = (config: TailwindConfig) => {
  const resolvedConfig = resolveConfig(config)

  const mediaScreens = getMediaScreens(resolvedConfig)

  const { utilitiesRoot, componentsRoot, baseRoot } = processTailwindPlugins(
    resolvedConfig
  )

  return {
    resolvedConfig,
    componentsRoot,
    utilitiesRoot,
    baseRoot,
    mediaScreens
  }
}
