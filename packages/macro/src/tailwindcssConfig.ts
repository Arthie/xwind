import path from "path"
import fs from "fs"

export const defaultConfigFile = "./tailwind.config.js"

const resolveTailwindConfigPath = (configFile?: string) => {
  const file = configFile ? configFile : defaultConfigFile
  try {
    const defaultConfigPath = path.resolve(file)
    fs.accessSync(defaultConfigPath)
    return defaultConfigPath
  } catch (err) {
    throw new Error(`Could not find '${file}' | ${err}`)
  }
}

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

export const resolveTailwindConfig = (configFile?: string): TailwindConfig => {
  const configPath = resolveTailwindConfigPath(configFile)
  const config = require(configPath)
  return config ? config : {}
}
