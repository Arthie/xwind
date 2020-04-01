export interface TwObjectBase {
  selector: string;
  decls: { [key: string]: string };
  type: string;
}

export interface TwComponentObject extends TwObjectBase {
  atRule?: string;
}

export interface TwUtilitiesObject extends TwObjectBase {
  variants?: string[];
}

export interface TwObject extends TwComponentObject, TwUtilitiesObject { }

export interface StyleObject {
  [key: string]: Decls | Rule | AtRule;
}

export type Decls = string;
export type Rule = { [key: string]: Decls };
export type AtRule = { [key: string]: Decls | Rule };

export interface TwStyleObject {
  variants?: string[];
  styleObject: StyleObject;
  type: string;
}
