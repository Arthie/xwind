import core, { resolveConfig, createTwClassDictionary } from "@xwind/core";
//@ts-expect-error postcss-js has no type definition
import { objectify } from "postcss-js";
//@ts-expect-error
import config from "../../../config/tailwindconfigs/example";

const resolvedConfig = resolveConfig(config);
const { utilitiesRoot, componentsRoot } = core(resolvedConfig);
const twObjectMap = createTwClassDictionary(utilitiesRoot, componentsRoot);

test(`Remainder test`, () => {
  expect(twObjectMap.XWIND_GLOBAL.toString()).toMatchSnapshot();
});

test(`Remainder object test`, () => {
  const object = objectify(twObjectMap.XWIND_GLOBAL);
  console.log(object);
  expect(object).toMatchSnapshot();
});
