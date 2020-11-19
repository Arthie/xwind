import clsx from "clsx";
import { TwClasses } from "@xwind/class-utilities";

export default (
  ...args: [arg1: TemplateStringsArray | TwClasses, ...rest: TwClasses[]]
): string => {
  throw new Error("xwind - Configure the babel plugin correctly");
};

export const cx = clsx;
