import postcss from "postcss"
import resolveConfig from "tailwindcss/resolveConfig"
import buildMediaQuery from "tailwindcss/lib/util/buildMediaQuery"
import corePlugins from "tailwindcss/lib/corePlugins"
import processPlugins from "tailwindcss/lib/util/processPlugins"

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

export const getMediaScreens = (config: TailwindConfig) => {
  const screens = Object.entries(config.theme.screens)
  const buildScreens = screens.map(([key, value]) => [
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
