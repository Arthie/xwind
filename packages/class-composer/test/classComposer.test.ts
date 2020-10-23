import initClasscomposer, {
  ParsedTwClass,
  twClassesComposer,
  twClassesGenerator,
  twClassesParser,
  twClassesSerializer,
} from "../lib/classComposer";

const SEPARATOR = ":";

const INPUT = [
  "    text-red-100       hover:text-red-200    sm:focus:text-red-300   ",
  `
    active[text-red-400 text-red-500]
    sm[hover:text-red-600]
    md:focus[text-red-700]
  `,
  "group-hover:text-red-800",
];

const COMPOSER_RESULT = [
  "text-red-100",
  "hover:text-red-200",
  "sm:focus:text-red-300",
  "active:text-red-400",
  "active:text-red-500",
  "sm:hover:text-red-600",
  "md:focus:text-red-700",
  "group-hover:text-red-800",
];

test("classesComposer", () => {
  expect(twClassesComposer(SEPARATOR)(INPUT)).toStrictEqual(COMPOSER_RESULT);
});

test("classesComposer: multiple args", () => {
  expect(twClassesComposer(SEPARATOR)(...INPUT)).toStrictEqual(COMPOSER_RESULT);
});

const VARIANT_PARSER_RESULT: ParsedTwClass[] = [
  ["text-red-100", []],
  ["text-red-200", ["hover"]],
  ["text-red-300", ["focus", "sm"]],
  ["text-red-400", ["active"]],
  ["text-red-500", ["active"]],
  ["text-red-600", ["hover", "sm"]],
  ["text-red-700", ["focus", "md"]],
  ["text-red-800", ["group-hover"]],
];

test("classesParser", () => {
  expect(twClassesParser(SEPARATOR)(INPUT)).toStrictEqual(
    VARIANT_PARSER_RESULT
  );
});

const SERIALIZER_RESULT =
  "text-red-100 hover:text-red-200 sm:focus:text-red-300 active:text-red-400 active:text-red-500 sm:hover:text-red-600 md:focus:text-red-700 group-hover:text-red-800";

test("classesSerializer", () => {
  expect(twClassesSerializer(SEPARATOR)(INPUT)).toStrictEqual(
    SERIALIZER_RESULT
  );
});

test("Composer wrong SEPARATOR type", () => {
  //@ts-expect-error
  expect(() => twClassesComposer([])).toThrow(/Separator/);
});

test("No nested variants", () => {
  expect(() => twClassesComposer(SEPARATOR)("sm[hover[text-red-200]]")).toThrow(
    /Nested variant/
  );
});

test("No separator in variants", () => {
  expect(() => initClasscomposer(SEPARATOR, ["  : "])).toThrow(
    /contain separator/
  );
});

test("No duplicates", () => {
  expect(
    twClassesComposer(SEPARATOR)("text-sm text-xl text-lg text-sm")
  ).toStrictEqual(["text-xl", "text-lg", "text-sm"]);
});

test("No classes composer", () => {
  expect(twClassesComposer(SEPARATOR)("        ")).toStrictEqual([]);
});

test("No classes parser", () => {
  expect(twClassesParser(SEPARATOR)("        ")).toStrictEqual([]);
});

test("No classes serializer", () => {
  expect(twClassesSerializer(SEPARATOR)("        ")).toStrictEqual("");
});

test("classesGenerator", () => {
  expect(twClassesGenerator(SEPARATOR)(VARIANT_PARSER_RESULT)).toStrictEqual(
    COMPOSER_RESULT
  );
});
