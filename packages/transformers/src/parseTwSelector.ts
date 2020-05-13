import { parse } from "css-what";

export function parseTwSelectorClass(twSelector: string) {
  const parsedTwSelector = parse(twSelector);
  if (parsedTwSelector.length !== 1) {
    throw new Error(
      `Only one selector is allowed but got ${parsedTwSelector.length} selectors from "${twSelector}"`
    );
  }
  const [classSelector] = parsedTwSelector[0];
  if (classSelector.type !== "attribute" || classSelector.name !== "class") {
    throw new Error(
      `Tailwind class not found in:"${twSelector}", the first element of the selector should be a class atrribute`
    );
  }
  return classSelector.value;
}

//unescape function taken from https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L152
function funescape(_: string, escaped: string, escapedWhitespace?: string) {
  const high = parseInt(escaped, 16) - 0x10000;

  // NaN means non-codepoint
  return high !== high || escapedWhitespace
    ? escaped
    : high < 0
    ? // BMP codepoint
      String.fromCharCode(high + 0x10000)
    : // Supplemental Plane codepoint (surrogate pair)
      String.fromCharCode((high >> 10) | 0xd800, (high & 0x3ff) | 0xdc00);
}

const reEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/gi;

export function unescapeCSS(str: string) {
  return str.replace(reEscape, funescape);
}
