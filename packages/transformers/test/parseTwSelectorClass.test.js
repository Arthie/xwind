const { parseTwSelectorClass, unescapeCSS } = require("../lib/parseTwSelector");

test("parse .prose-lg thead th:first-child", () => {
  expect(parseTwSelectorClass(".prose-lg thead th:first-child")).toStrictEqual(
    "prose-lg"
  );
});

test("parse .container", () => {
  expect(parseTwSelectorClass(".container")).toStrictEqual("container");
});

test("parse .form-input::placeholder", () => {
  expect(parseTwSelectorClass(".form-input::placeholder")).toStrictEqual(
    "form-input"
  );
});

test("parse .form-checkbox:checked:focus", () => {
  expect(parseTwSelectorClass(".form-checkbox:checked:focus")).toStrictEqual(
    "form-checkbox"
  );
});

test("parse .prose-2xl ul ul, .prose-2xl ul ol, .prose-2xl ol ul, .prose-2xl ol ol", () => {
  expect(
    parseTwSelectorClass(
      ".prose-2xl ul ul, .prose-2xl ul ol, .prose-2xl ol ul, .prose-2xl ol ol"
    )
  ).toStrictEqual("prose-2xl");
});

test("parse .prose-2xl hr + *", () => {
  expect(parseTwSelectorClass(".prose-2xl hr + *")).toStrictEqual("prose-2xl");
});

test("parse .prose-2xl > ul > li > *:last-child", () => {
  expect(
    parseTwSelectorClass(".prose-2xl > ul > li > *:last-child")
  ).toStrictEqual("prose-2xl");
});

test(`parse .prose-2xl [class~="lead"]`, () => {
  expect(parseTwSelectorClass(`.prose-2xl [class~="lead"]`)).toStrictEqual(
    "prose-2xl"
  );
});

test(`parse  .translate-y-0\\.5`, () => {
  expect(parseTwSelectorClass(` .translate-y-0\\.5`)).toStrictEqual(
    "translate-y-0.5"
  );
});

test(`parse  .translate-y-1\\/2`, () => {
  expect(parseTwSelectorClass(` .translate-y-1\\/2`)).toStrictEqual(
    "translate-y-1/2"
  );
});

test("First element not a Tailwind class", () => {
  expect(() => parseTwSelectorClass("a")).toThrow(/Tailwind/);
});
