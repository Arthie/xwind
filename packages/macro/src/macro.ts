import { createMacro, MacroHandler } from "babel-plugin-macros"
import { resolveTailwindConfig } from "./tailwindcssConfig"
import { tailwindcssInJs } from "./tailwindcssInJs"
import { transformStyleObjectToCssString } from "@tailwindcssinjs/transformers"

const defaultMacroConfig = {
  format: "object"
}

const tailwindcssInJsMacro: MacroHandler = ({
  references,
  state,
  babel: { types: t },
  //@ts-ignore
  config: macroConfig = defaultMacroConfig
}) => {
  const config = resolveTailwindConfig()
  if (!config) {
    throw new Error(
      "No config file found. Add `tailwind.config.js` to your project"
    )
  }
  const tailwind = tailwindcssInJs(config)

  references.default.forEach(referencePath => {
    if (referencePath.parentPath.type === "CallExpression") {
      if (referencePath === referencePath.parentPath.get("callee")) {
        //@ts-ignore
        const args = referencePath.parentPath
          .get("arguments")
          //@ts-ignore
          .map((value: any) => {
            return value.evaluate().value
          })

        const cssObj = tailwind(...args)

        if (macroConfig.format === "string") {
          const css = transformStyleObjectToCssString(cssObj)
          referencePath.parentPath.replaceWith(t.stringLiteral(css))
        }

        if (macroConfig.format === "object") {
          referencePath.parentPath.replaceWithSourceString(
            JSON.stringify(cssObj)
          )
        }
      }
    }
  })
}

export default createMacro(tailwindcssInJsMacro, {
  configName: "tailwindcssinjs"
})
