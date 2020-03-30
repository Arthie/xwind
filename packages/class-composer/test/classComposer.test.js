
const {
  twClassesComposer,
  twClassesVariantsParser,
  twClassesSerializer
} = require("../lib/classComposer")

const SEPARATOR = ":"

const inputArray = [
  "    text-red-100       hover:text-red-200    sm:focus:text-red-300   ",
  `
    active[text-red-400]
    sm:hover[text-red-500]
    md:focus[text-red-600]
  `
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
  expect(twClassesComposer(SEPARATOR)(inputArray)).toStrictEqual(
    inputArrayComposerResult
  )
})

test("Composer function spread args", () => {
  expect(twClassesComposer(SEPARATOR)(...inputArray)).toStrictEqual(
    inputArrayComposerResult
  )
})

test("Composer tag", () => {
  expect(
    twClassesComposer(SEPARATOR)`focus[bg-red-200] text-red-100 bg-red-100
    hover[text-red-200]
    focus[text-red-300]`
  ).toStrictEqual(["focus:bg-red-200", "text-red-100", "bg-red-100", "hover:text-red-200", "focus:text-red-300"])
})

test("Serializer inputArray", () => {
  expect(twClassesSerializer(SEPARATOR)(inputArray)).toBe(
    inputArraySerializerResult
  )
})

test("MapParser inputArray", () => {
  expect(twClassesVariantsParser(SEPARATOR)(inputArray)).toStrictEqual(
    inputArrayMapParserResult
  )
})

test("MapParser inputArray2", () => {
  expect(twClassesVariantsParser(SEPARATOR)(["text-red-100 hover:text-red-100"])).toStrictEqual(
    [
      ["text-red-100", []],
      ["text-red-100", ["hover"]],
    ]
  )
})

test("Composer wrong SEPARATOR type", () => {
  expect(() => twClassesComposer([])).toThrow(/Separator/)
})