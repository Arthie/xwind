import { parse, stringify } from "css-what";

export function parseTwSelector(twSelector: string) {
  const parsedTwSelector = parse(twSelector);
  if (parsedTwSelector.length !== 1) {
    throw new Error(
      `Only one selector is allowed but got ${parsedTwSelector.length} selectors from "${twSelector}"`
    );
  }
  const [classSelector, ...otherSelectors] = parsedTwSelector[0];
  if (classSelector.type !== "attribute" || classSelector.name !== "class") {
    throw new Error(
      `Tailwind class not found in:"${twSelector}", the first element of the selector should be a class atrribute`
    );
  }
  return {
    selector: stringify(parsedTwSelector),
    class: classSelector.value,
    remainder: stringify([otherSelectors]),
  };
}
