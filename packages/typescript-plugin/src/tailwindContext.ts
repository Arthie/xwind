import "core-js/stable/string/match-all";
import { TemplateContext } from "typescript-template-language-service-decorator";
export interface TailwindContextRange {
  start: ts.LineAndCharacter;
  end: ts.LineAndCharacter;
}

export interface TailwindContextBase {
  type: string;
  text: string;
  index: number;
  range: TailwindContextRange;
}

export interface TailwindContextClass extends TailwindContextBase {
  type: "class";
}

export interface TailwindContextVariant extends TailwindContextBase {
  type: "variant";
  variant: string[];
  class: TailwindContextClass;
}

export interface TailwindContextVariantArray extends TailwindContextBase {
  type: "array";
  variant: string[];
  classes: TailwindContextClass[];
}

export type TailwindContext =
  | TailwindContextClass
  | TailwindContextVariant
  | TailwindContextVariantArray;

export function getTailwindContextFromTemplateContext(
  context: TemplateContext,
  separator: string
): TailwindContext[] {
  const { text } = context;
  const VARIANT_ARRAY_SYNTAX_REGEX = new RegExp(
    `(\\S+(?:\\${separator}\\w+)?)\\[((?:.|\\n)*?)\\]`,
    "g"
  );
  const VARIANT_REGEX = new RegExp(`(?:(\\S+)${separator})+(\\S+)`, "g");
  const NOT_WHITE_SPACE_REGEX = /\S+/g;
  const REPLACE_REGEX = /[^\n]/g;
  const templateContextClasses: TailwindContext[] = [];

  const variantArraySyntaxReplacer = (
    substring: string,
    ...searchResult: any[]
  ) => {
    //searchResult contains substring capture groups and index
    const [variant, variantclasses, searchIndex] = searchResult as [
      string,
      string,
      number
    ];

    //matches tailwind classes and removes whitespace
    //" text-red-100  bg-blue-200 " => ["text-red-100", "bg-blue-200"]
    const twClasses = variantclasses.match(NOT_WHITE_SPACE_REGEX) ?? [];
    const classes: TailwindContextClass[] = [];
    for (const twClass of twClasses) {
      const index = searchIndex + substring.indexOf(twClass);
      classes.push({
        type: "class",
        text: twClass,
        index,
        range: {
          start: context.toPosition(index),
          end: context.toPosition(index + twClass.length),
        },
      });
    }
    templateContextClasses.push({
      type: "array",
      variant: variant.split(separator),
      classes,
      text: substring,
      index: searchIndex,
      range: {
        start: context.toPosition(searchIndex),
        end: context.toPosition(searchIndex + substring.length),
      },
    });

    return substring.replace(REPLACE_REGEX, " ");
  };

  const variantArrayLess = text.replace(
    VARIANT_ARRAY_SYNTAX_REGEX,
    variantArraySyntaxReplacer
  );

  const variantClassReplacer = (substring: string, ...searchResult: any[]) => {
    //searchResult contains substring capture groups and index
    const [variant, twClass, searchIndex] = searchResult as [
      string,
      string,
      number
    ];

    const index = searchIndex + substring.indexOf(twClass);
    templateContextClasses.push({
      type: "variant",
      variant: variant.split(separator),
      text: substring,
      class: {
        type: "class",
        text: twClass,
        index,
        range: {
          start: context.toPosition(index),
          end: context.toPosition(index + twClass.length),
        },
      },
      index: searchIndex,
      range: {
        start: context.toPosition(searchIndex),
        end: context.toPosition(searchIndex + substring.length),
      },
    });

    return substring.replace(REPLACE_REGEX, " ");
  };

  const variantLess = variantArrayLess.replace(
    VARIANT_REGEX,
    variantClassReplacer
  );

  //@ts-expect-error matchAll is not valid ES2019 but its polyfilled by core-js import
  const twClassMatches = variantLess.matchAll(NOT_WHITE_SPACE_REGEX);
  for (const twClassMatch of twClassMatches) {
    const index = twClassMatch.index;
    if (typeof index === "number") {
      templateContextClasses.push({
        type: "class",
        text: twClassMatch[0],
        index,
        range: {
          start: context.toPosition(index),
          end: context.toPosition(index + twClassMatch[0].length),
        },
      });
    }
  }
  return templateContextClasses;
}

export function getTailwindContextFromPosition(
  tailwindContexts: TailwindContext[],
  position: ts.LineAndCharacter
) {
  for (const tailwindContext of tailwindContexts) {
    if (isPositionInTailwindContextRange(position, tailwindContext.range)) {
      return tailwindContext;
    }
  }
}

export function isPositionInTailwindContextRange(
  position: ts.LineAndCharacter,
  tailwindContextRange: TailwindContextRange
) {
  const classStartLine = tailwindContextRange.start.line;
  const classEndLine = tailwindContextRange.end.line;
  const classStartCharacter = tailwindContextRange.start.character;
  const classEndCharacter = tailwindContextRange.end.character;
  const line = position.line;
  const character = position.character;
  let insideLine = false;
  let insideChar = false;
  if (
    (line === classStartLine && character >= classStartCharacter) ||
    line > classStartLine
  ) {
    insideLine = true;
  }
  if (
    (line === classEndLine && character <= classEndCharacter) ||
    line < classEndLine
  ) {
    insideChar = true;
  }

  if (insideLine && insideChar) {
    return true;
  } else {
    return false;
  }
}
