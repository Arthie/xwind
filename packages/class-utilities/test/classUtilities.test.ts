import initClasscomposer, {
  composer,
  generator,
  parser,
  serializer,
} from "@xwind/class-utilities";

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
  expect(composer(SEPARATOR, ...INPUT)).toStrictEqual(COMPOSER_RESULT);
});

test("classesComposer: multiple args", () => {
  expect(composer(SEPARATOR, ...INPUT)).toStrictEqual(COMPOSER_RESULT);
});

const VARIANT_PARSER_RESULT = [
  {
    class: "text-red-100",
    variants: [],
  },
  {
    class: "text-red-200",
    variants: ["hover"],
  },
  {
    class: "text-red-300",
    variants: ["focus", "sm"],
  },
  {
    class: "text-red-400",
    variants: ["active"],
  },
  {
    class: "text-red-500",
    variants: ["active"],
  },
  {
    class: "text-red-600",
    variants: ["hover", "sm"],
  },
  {
    class: "text-red-700",
    variants: ["focus", "md"],
  },
  {
    class: "text-red-800",
    variants: ["group-hover"],
  },
];

test("classesParser", () => {
  expect(parser(SEPARATOR, INPUT)).toStrictEqual(VARIANT_PARSER_RESULT);
});

const SERIALIZER_RESULT =
  "text-red-100 hover:text-red-200 sm:focus:text-red-300 active:text-red-400 active:text-red-500 sm:hover:text-red-600 md:focus:text-red-700 group-hover:text-red-800";

test("classesSerializer", () => {
  expect(serializer(SEPARATOR, INPUT)).toStrictEqual(SERIALIZER_RESULT);
});

test("Composer wrong SEPARATOR type", () => {
  //@ts-expect-error
  expect(() => composer([])).toThrow(/Separator/);
});

test("No nested variants", () => {
  expect(() => composer(SEPARATOR, "sm[hover[text-red-200]]")).toThrow(
    /Nested variant/
  );
});

test("No separator in variants", () => {
  expect(() => initClasscomposer(SEPARATOR, ["  : "])).toThrow(
    /contain separator/
  );
});

test("No duplicates", () => {
  expect(composer(SEPARATOR, "text-sm text-xl text-lg text-sm")).toStrictEqual([
    "text-xl",
    "text-lg",
    "text-sm",
  ]);
});

test("No classes composer", () => {
  expect(composer(SEPARATOR, "        ")).toStrictEqual([]);
});

test("No classes parser", () => {
  expect(parser(SEPARATOR, "        ")).toStrictEqual([]);
});

test("No classes serializer", () => {
  expect(serializer(SEPARATOR, "        ")).toStrictEqual("");
});

test("classesGenerator", () => {
  expect(generator(SEPARATOR, VARIANT_PARSER_RESULT)).toStrictEqual(
    COMPOSER_RESULT
  );
});

test("classesGenerator 2", () => {
  expect(
    initClasscomposer(SEPARATOR).generator(
      [
        {
          class: "bg-red-200",
          variants: ["hover"],
        },
      ],
      {
        class: "bg-blue-200",
        variants: ["hover"],
      }
    )
  ).toStrictEqual(["hover:bg-red-200", "hover:bg-blue-200"]);
});

test("classesGenerator 3", () => {
  expect(
    generator(
      SEPARATOR,
      [
        {
          class: "bg-red-200",
          variants: ["hover"],
        },
      ],
      {
        class: "bg-red-200",
        variants: ["hover"],
      }
    )
  ).toStrictEqual(["hover:bg-red-200"]);
});

test("classesGenerator 4", () => {
  expect(
    initClasscomposer(SEPARATOR).generator([
      {
        class: "bg-red-200",
        variants: ["hover"],
      },
      {
        class: "bg-blue-200",
        variants: ["hover"],
      },
      {
        class: "bg-red-200",
        variants: ["hover", "dark", "md"],
      },
    ])
  ).toStrictEqual([
    "hover:bg-red-200",
    "hover:bg-blue-200",
    "md:dark:hover:bg-red-200",
  ]);
});
