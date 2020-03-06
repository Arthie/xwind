
const {
  twClassesComposer,
  twClassesComposerTag,
  twClassesVariantsParser,
  twClassesVariantsParserTag,
  twClassesSerializer,
  twClassesSerializerTag
} = require("../dist/classComposer")

const SEPARATOR = ":"

const inputArray = [
  "    text-red-100       hover:text-red-200    sm:focus:text-red-300   ",
  {
    active: "  text-red-400  ",
    sm: {
      hover: "  text-red-500"
    },
    "md:focus": " text-red-600    "
  }
]

const inputArrayComposerResult = [
  "text-red-100",
  "hover:text-red-200",
  "sm:focus:text-red-300",
  "active:text-red-400",
  "sm:hover:text-red-500",
  "md:focus:text-red-600"
]
const inputArraySerializerResult =
  "text-red-100 hover:text-red-200 sm:focus:text-red-300 active:text-red-400 sm:hover:text-red-500 md:focus:text-red-600"
const inputArrayMapParserResult = [
  ["text-red-100", []],
  ["text-red-200", ["hover"]],
  ["text-red-300", ["focus", "sm"]],
  ["text-red-400", ["active"]],
  ["text-red-500", ["hover", "sm"]],
  ["text-red-600", ["focus", "md"]]
]

test("Composer inputArray", () => {
  expect(twClassesComposer(inputArray, SEPARATOR)).toStrictEqual(
    inputArrayComposerResult
  )
})

test("Serializer inputArray", () => {
  expect(twClassesSerializer(inputArray, SEPARATOR)).toBe(
    inputArraySerializerResult
  )
})

test("MapParser inputArray", () => {
  expect(twClassesVariantsParser(inputArray, SEPARATOR)).toStrictEqual(
    inputArrayMapParserResult
  )
})

test("MapParser inputArray2", () => {
  expect(twClassesVariantsParser(["text-red-100 hover:text-red-100"], SEPARATOR)).toStrictEqual(
    [
      ["text-red-100", []],
      ["text-red-100", ["hover"]],
    ]
  )
})

const inputSet = new Set(["  text-red-100   ", " text-red-200"])

const inputSetComposerResult = ["text-red-100", "text-red-200"]

test("Composer inputSet", () => {
  expect(twClassesComposer(inputSet, SEPARATOR)).toStrictEqual(
    inputSetComposerResult
  )
})

test("Composer wrong input type", () => {
  expect(() => twClassesComposer("", SEPARATOR)).toThrow(/Array and Set/)
})

test("Composer wrong SEPARATOR type", () => {
  expect(() => twClassesComposer([])).toThrow(/Separator/)
})

test("Composer unsupported TwClass type", () => {
  expect(() => twClassesComposer([{ hover: ["text-red-200"] }], SEPARATOR)).toThrow(
    /not supported/
  )
})

const inputComposerTagResult = [
  "focus:bg-red-200",
  "text-red-100",
  "bg-red-100",
  "hover:text-red-200",
  "focus:text-red-300",
]

test("ComposerTag", () => {
  expect(
    twClassesComposerTag(SEPARATOR)`${{ focus: "bg-red-200" }} text-red-100 bg-red-100 ${{
      hover: "text-red-200"
    }} focus:text-red-300`
  ).toStrictEqual(inputComposerTagResult)
})

const inputSerializerTagResult =
  "text-red-100 hover:text-red-200 focus:text-red-300"

test("SerializerTag", () => {
  expect(
    twClassesSerializerTag(SEPARATOR)` text-red-100 ${{
      hover: "text-red-200"
    }} focus:text-red-300`
  ).toBe(inputSerializerTagResult)
})

const inputArrayMapParserTagResult = [
  ["text-red-100", []],
  ["text-red-200", ["hover"]],
  ["text-red-300", ["focus"]]
]

test("MapParserTag", () => {
  expect(
    twClassesVariantsParserTag(SEPARATOR)` text-red-100 ${{
      hover: "text-red-200"
    }} focus:text-red-300`
  ).toStrictEqual(inputArrayMapParserTagResult)
})
