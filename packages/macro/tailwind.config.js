const plugin = require('tailwindcss/plugin')

module.exports = {
  theme: {
    extend: {
      screens: {
        portrait: { raw: "(orientation: portrait)" },
        md2: [
          // Sidebar appears at 768px, so revert to `sm:` styles between 768px
          // and 868px, after which the main content area is wide enough again to
          // apply the `md:` styles.
          { min: "668px", max: "767px" },
          { min: "868px" }
        ]
      },
      colors: {
        primary: "#6200ee",
        onPrimary: "#ffffff",
        secondary: "#018786",
        onSecondary: "#ffffff",
        error: "#b00020",
        onError: "#ffffff",
        surface: "#ffffff",
        onSurface: "#000000",
        background: "#ffffff"
      },
      spacing: {
        "72": "18rem",
        "84": "21rem",
        "96": "24rem"
      },
      fontSize: {
        "7xl": "5rem"
      },
      borderWidth: {
        "6": "6px",
        "8": "8px"
      },
      maxWidth: {
        bpsm: "640px",
        bpmd: "768px",
        bplg: "1024px",
        bpxl: "1280px"
      }
    }
  },
  variants: {
    backgroundColor: ["responsive", "hover", "focus", "active"]
  },
  plugins: [
    require("@tailwindcss/ui")({
      layout: "sidebar"
    }),
    plugin(function ({ addVariant, e, postcss }) {
      addVariant('supports-grid', ({ container, separator }) => {
        const supportsRule = postcss.atRule({ name: 'supports', params: '(display: grid)' })
        supportsRule.append(container.nodes)
        container.append(supportsRule)
        supportsRule.walkRules(rule => {
          rule.selector = `.${e(`supports-grid${separator}${rule.selector.slice(1)}`)}`
        })
      })
    }),
    plugin(function ({ addVariant }) {
      addVariant('important', ({ container }) => {
        container.walkRules(rule => {
          rule.selector = `.\\!${rule.selector.slice(1)}`
          rule.walkDecls(decl => {
            decl.important = true
          })
        })
      })
    })
  ]
};
