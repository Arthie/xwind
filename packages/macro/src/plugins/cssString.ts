//@ts-expect-error
import postcssJs from "postcss-js";
import { ObjectStyle } from "@tailwindcssinjs/tailwindcss-data/lib/transformers";

export default function cssString(objectStyle: ObjectStyle): string {
  return postcssJs.parse(objectStyle).toString();
}
