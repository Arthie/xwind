
const {
  twClassesComposer,
  twClassesComposerTag,
  twClassesMapParser,
  twClassesMapParserTag,
  twClassesSerializer,
  twClassesSerializerTag
} = require("../dist/classComposer")

const separator = ":"

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
const inputArrayMapParserResult = new Map([
  ["text-red-100", []],
  ["text-red-200", ["hover"]],
  ["text-red-300", ["focus", "sm"]],
  ["text-red-400", ["active"]],
  ["text-red-500", ["hover", "sm"]],
  ["text-red-600", ["focus", "md"]]
])

test("Composer inputArray", () => {
  expect(twClassesComposer(inputArray, separator)).toStrictEqual(
    inputArrayComposerResult
  )
})

test("Serializer inputArray", () => {
  expect(twClassesSerializer(inputArray, separator)).toBe(
    inputArraySerializerResult
  )
})

test("MapParser inputArray", () => {
  expect(twClassesMapParser(inputArray, separator)).toStrictEqual(
    inputArrayMapParserResult
  )
})

const inputSet = new Set(["  text-red-100", " text-red-200"])

const inputSetComposerResult = ["text-red-100", "text-red-200"]

test("Composer inputSet", () => {
  expect(twClassesComposer(inputSet, separator)).toStrictEqual(
    inputSetComposerResult
  )
})

test("Composer wrong input type", () => {
  expect(() => twClassesComposer("", separator)).toThrow(/Array and Set/)
})

test("Composer wrong separator type", () => {
  expect(() => twClassesComposer([])).toThrow(/Separator/)
})

test("Composer unsupported TwClass type", () => {
  expect(() => twClassesComposer([["text-red-200"]], separator)).toThrow(
    /not supported/
  )
})

const inputComposerTagResult = [
  "text-red-100",
  "focus:text-red-300",
  "hover:text-red-200"
]

test("ComposerTag", () => {
  expect(
    twClassesComposerTag(separator)` text-red-100 ${{
      hover: "text-red-200"
    }} focus:text-red-300`
  ).toStrictEqual(inputComposerTagResult)
})

const inputSerializerTagResult =
  "text-red-100 focus:text-red-300 hover:text-red-200"

test("SerializerTag", () => {
  expect(
    twClassesSerializerTag(separator)` text-red-100 ${{
      hover: "text-red-200"
    }} focus:text-red-300`
  ).toBe(inputSerializerTagResult)
})

const inputArrayMapParserTagResult = new Map([
  ["text-red-100", []],
  ["text-red-200", ["hover"]],
  ["text-red-300", ["focus"]]
])

test("MapParserTag", () => {
  expect(
    twClassesMapParserTag(separator)` text-red-100 ${{
      hover: "text-red-200"
    }} focus:text-red-300`
  ).toStrictEqual(inputArrayMapParserTagResult)
})
