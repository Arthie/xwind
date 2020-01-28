import { StyleObject } from "./transformTypes"

const hyphenate = (s: string) => s.replace(/[A-Z]|^ms/g, "-$&").toLowerCase()

const createDecl = (key: string, value: string) => `${hyphenate(key)}:${value};`

const createRule = (selector: string, decls: string) => `${selector}{${decls}}`

export const transformStyleObjectToCssString = (obj: StyleObject) => {
  const css: string[] = []

  for (const key in obj) {
    const value = obj[key]
    if (typeof value === "string" || typeof value === "number") {
      css.push(createDecl(key, value))
    }
    if (typeof value === "object") {
      css.push(createRule(key, transformStyleObjectToCssString(value)))
    }
  }

  return css.join("")
}
