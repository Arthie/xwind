
const {
  twClassesComposer,
  twClassesComposerFunction,
  twClassesComposerTag,
  twClassesVariantsParser,
  twClassesVariantsParserFunction,
  twClassesVariantsParserTag,
  twClassesSerializer,
  twClassesSerializerFunction,
  twClassesSerializerTag,
} = require("../lib/classComposer")

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

test("ComposerFunction inputArray", () => {
  expect(twClassesComposerFunction(inputArray, SEPARATOR)).toStrictEqual(
    inputArrayComposerResult
  )
})

test("Composer function spread args", () => {
  expect(twClassesComposer(SEPARATOR)(...inputArray)).toStrictEqual(
    inputArrayComposerResult
  )
})

test("Composer function array args", () => {
  expect(twClassesComposer(SEPARATOR)(inputArray)).toStrictEqual(
    inputArrayComposerResult
  )
})

test("Composer tag", () => {
  expect(
    twClassesComposer(SEPARATOR)`${{ focus: "bg-red-200" }} text-red-100 bg-red-100 ${{
      hover: "text-red-200"
    }} focus:text-red-300`
  ).toStrictEqual(inputComposerTagResult)
})

test("Serializer inputArray", () => {
  expect(twClassesSerializerFunction(inputArray, SEPARATOR)).toBe(
    inputArraySerializerResult
  )
})

test("MapParser inputArray", () => {
  expect(twClassesVariantsParserFunction(inputArray, SEPARATOR)).toStrictEqual(
    inputArrayMapParserResult
  )
})

test("MapParser inputArray2", () => {
  expect(twClassesVariantsParserFunction(["text-red-100 hover:text-red-100"], SEPARATOR)).toStrictEqual(
    [
      ["text-red-100", []],
      ["text-red-100", ["hover"]],
    ]
  )
})

test("Composer wrong input type", () => {
  expect(() => twClassesComposerFunction("", SEPARATOR)).toThrow(/Array/)
})

test("Composer wrong SEPARATOR type", () => {
  expect(() => twClassesComposerFunction([])).toThrow(/Separator/)
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
