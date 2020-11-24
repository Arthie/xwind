//@ts-expect-error
import postcssJs from "postcss-js";
import { Objectstyle } from "@xwind/core/lib/utilities";

function css(objectstyle: Objectstyle): string {
  return postcssJs.parse(objectstyle).toString();
}

export default css;
