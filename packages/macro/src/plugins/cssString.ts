//@ts-expect-error
import postcssJs from "postcss-js";
import { ObjectStyle } from "../../../tailwindcss-data/lib/utilities";

export default function cssString(objectStyle: ObjectStyle): string {
  return postcssJs.parse(objectStyle).toString();
}
