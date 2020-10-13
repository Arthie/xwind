//@ts-expect-error
import * as plugins from "./devCorePlugins.js";
import configurePlugins from "tailwindcss/lib/util/configurePlugins";

export default function ({ corePlugins: corePluginConfig }: any) {
  return configurePlugins(corePluginConfig)
    .filter((value: string) => value !== "preflight")
    .map((pluginName: string) => {
      return plugins[pluginName]();
    });
}
