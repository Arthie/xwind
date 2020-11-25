//@ts-check
const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: "class",
  experimental: "all",
  future: "all",
  theme: {
    extend: {
      screens: {
        portrait: { raw: "(orientation: portrait)" },
        md2: [
          // Sidebar appears at 768px, so revert to `sm:` styles between 768px
          // and 868px, after which the main content area is wide enough again to
          // apply the `md:` styles.
          { min: "668px", max: "767px" },
          { min: "868px" },
        ],
      },
      fill: (theme) => theme("colors"),
    },
  },
  variants: {},
  plugins: [
    plugin(function ({ addVariant, e, postcss }) {
      addVariant("supports-grid", ({ container, separator }) => {
        const supportsRule = postcss.atRule({
          name: "supports",
          params: "(display: grid)",
        });
        supportsRule.append(container.nodes);
        container.append(supportsRule);
        supportsRule.walkRules((rule) => {
          rule.selector = `.${e(
            `supports-grid${separator}${rule.selector.slice(1)}`
          )}`;
        });
      });
    }),
    plugin(function ({
      addVariant,
      addUtilities,
      addComponents,
      e,
      prefix,
      config,
    }) {
      addVariant("important", ({ container }) => {
        container.walkRules((rule) => {
          rule.selector = `.important\\${config(
            "separator"
          )}${rule.selector.slice(1)}`;
          rule.walkDecls((decl) => {
            decl.important = true;
          });
        });
      });
    }),
  ],
  xwind: {
    // plugins: [require("./lib/plugins/cssString").default],
    mode: "objectstyles",
  },
};
