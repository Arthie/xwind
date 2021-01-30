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
  expect(composer(INPUT, SEPARATOR)).toStrictEqual(COMPOSER_RESULT);
});

test("classesComposer: multiple args", () => {
  expect(composer(INPUT, SEPARATOR)).toStrictEqual(COMPOSER_RESULT);
});

const VARIANT_PARSER_RESULT = [
  {
    twClass: "text-red-100",
    variants: [],
  },
  {
    twClass: "text-red-200",
    variants: ["hover"],
  },
  {
    twClass: "text-red-300",
    variants: ["focus", "sm"],
  },
  {
    twClass: "text-red-400",
    variants: ["active"],
  },
  {
    twClass: "text-red-500",
    variants: ["active"],
  },
  {
    twClass: "text-red-600",
    variants: ["hover", "sm"],
  },
  {
    twClass: "text-red-700",
    variants: ["focus", "md"],
  },
  {
    twClass: "text-red-800",
    variants: ["group-hover"],
  },
];

test("classesParser", () => {
  expect(parser(INPUT, SEPARATOR)).toStrictEqual(VARIANT_PARSER_RESULT);
});

const SERIALIZER_RESULT =
  "text-red-100 hover:text-red-200 sm:focus:text-red-300 active:text-red-400 active:text-red-500 sm:hover:text-red-600 md:focus:text-red-700 group-hover:text-red-800";

test("classesSerializer", () => {
  expect(serializer(INPUT, SEPARATOR)).toStrictEqual(SERIALIZER_RESULT);
});

test("Composer wrong SEPARATOR type", () => {
  //@ts-expect-error
  expect(() => composer([])).toThrow(/Separator/);
});

test("No nested variants", () => {
  expect(() => composer("sm[hover[text-red-200]]", SEPARATOR)).toThrow(
    /Nested variant/
  );
});

test("No separator in variants", () => {
  expect(() => initClasscomposer(SEPARATOR, ["  : "])).toThrow(
    /contain separator/
  );
});

test("No duplicates", () => {
  expect(composer("text-sm text-xl text-lg text-sm", SEPARATOR)).toStrictEqual([
    "text-xl",
    "text-lg",
    "text-sm",
  ]);
});

test("No classes composer", () => {
  expect(composer("        ", SEPARATOR)).toStrictEqual([]);
});

test("No classes parser", () => {
  expect(parser("        ", SEPARATOR)).toStrictEqual([]);
});

test("No classes serializer", () => {
  expect(serializer("        ", SEPARATOR)).toStrictEqual("");
});

test("classesGenerator", () => {
  expect(generator(VARIANT_PARSER_RESULT, SEPARATOR)).toStrictEqual(
    COMPOSER_RESULT
  );
});

test("classesGenerator 2", () => {
  expect(
    initClasscomposer(SEPARATOR).generator(
      [
        {
          twClass: "bg-red-200",
          variants: ["hover"],
        },
      ],
      {
        twClass: "bg-blue-200",
        variants: ["hover"],
      }
    )
  ).toStrictEqual(["hover:bg-red-200", "hover:bg-blue-200"]);
});

test("classesGenerator 3", () => {
  expect(
    generator(
      [
        {
          twClass: "bg-red-200",
          variants: ["hover"],
        },
      ],
      SEPARATOR
    )
  ).toStrictEqual(["hover:bg-red-200"]);
});

test("classesGenerator 4", () => {
  expect(
    initClasscomposer(SEPARATOR).generator([
      {
        twClass: "bg-red-200",
        variants: ["hover"],
      },
      {
        twClass: "bg-blue-200",
        variants: ["hover"],
      },
      {
        twClass: "bg-red-200",
        variants: ["hover", "dark", "md"],
      },
    ])
  ).toStrictEqual([
    "hover:bg-red-200",
    "hover:bg-blue-200",
    "md:dark:hover:bg-red-200",
  ]);
});
