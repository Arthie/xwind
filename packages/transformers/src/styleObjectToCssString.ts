import postcssJs from "postcss-js"
import { StyleObject } from "./transformerTypes"

export const transformStyleObjectToCssString = (obj: StyleObject): string =>
  postcssJs.parse(obj).toString()
