import "core-js/stable/string/match-all";
import { TemplateContext } from "typescript-template-language-service-decorator";

export interface TemplateContextClassRange {
  start: ts.LineAndCharacter;
  end: ts.LineAndCharacter;
}

export interface TemplateContextClass {
  class: {
    text: string;
    index: number;
    range: TemplateContextClassRange;
  };
  variant?: {
    text: string;
    index: number;
    range: TemplateContextClassRange;
  };
}

export function getTemplateContextClassesFromTemplateContext(
  context: TemplateContext,
  separator: string
): TemplateContextClass[] {
  const { text } = context;
  const VARIANT_ARRAY_SYNTAX_REGEX = new RegExp(
    `(?<variant>\\S+(?:\\${separator}\\w+)?)\\[(?<classes>(?:.|\\n)*?)\\]`,
    "g"
  );
  const VARIANT_REGEX = new RegExp(
    `(?:(?<variant>\\S+)${separator})+(?<classes>\\S+)`,
    "g"
  );
  const NOT_WHITE_SPACE_REGEX = /\S+/g;

  const REPLACE_REGEX = /[^\n]/g;

  const templateContextClasses: TemplateContextClass[] = [];

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
    for (const twClass of twClasses) {
      const index = searchIndex + substring.indexOf(twClass);
      templateContextClasses.push({
        class: {
          text: twClass,
          index,
          range: {
            start: context.toPosition(index),
            end: context.toPosition(index + twClass.length),
          },
        },
        variant: {
          text: variant,
          index: searchIndex,
          range: {
            start: context.toPosition(searchIndex),
            end: context.toPosition(searchIndex + variant.length),
          },
        },
      });
    }
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
      class: {
        text: twClass,
        index,
        range: {
          start: context.toPosition(index),
          end: context.toPosition(index + twClass.length),
        },
      },
      variant: {
        text: variant,
        index: searchIndex,
        range: {
          start: context.toPosition(searchIndex),
          end: context.toPosition(searchIndex + variant.length),
        },
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
    if (index) {
      templateContextClasses.push({
        class: {
          text: twClassMatch[0],
          index,
          range: {
            start: context.toPosition(index),
            end: context.toPosition(index + twClassMatch[0].length),
          },
        },
      });
    }
  }
  return templateContextClasses;
}

export function isPositionInTemplateContextClassRange(
  position: ts.LineAndCharacter,
  templateContextClassRange: TemplateContextClassRange
) {
  const classStartLine = templateContextClassRange.start.line;
  const classEndLine = templateContextClassRange.end.line;
  const classStartCharacter = templateContextClassRange.start.character;
  const classEndCharacter = templateContextClassRange.end.character;
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
