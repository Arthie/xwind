//@ts-expect-error
import postcssJs from "postcss-js";
import { StyleObject } from "@tailwindcssinjs/tailwindcss-data/lib/transformers";

export default function cssString(styleObject: StyleObject): string {
  return postcssJs.parse(styleObject).toString();
}
