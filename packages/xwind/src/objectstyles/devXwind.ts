import isEqual from "lodash/isEqual";
import { ResolvedXwindTailwindConfig } from "../xwindConfig";

let $config: ResolvedXwindTailwindConfig | undefined;
export default function (config: ResolvedXwindTailwindConfig) {
  if (typeof $config === "undefined") {
    $config = config;
  } else if (!isEqual($config, config)) {
    console.warn(
      "XWIND: Tailwind config has changed. If you have babel caching enabled you'll need to clear the babel cache manually and rebuild for the changes to be visible."
    );
    $config = config;
  }
}
