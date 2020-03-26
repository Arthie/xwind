import postcssJs from "postcss-js";
import { StyleObject } from "./transformersTypes";

export const transformStyleObjectToCssString = (obj: StyleObject): string =>
  postcssJs.parse(obj).toString();
