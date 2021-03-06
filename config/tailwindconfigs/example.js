//@ts-check
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class", //'media' or 'class'
  experimental: "all",
  future: "all",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {},
  plugins: [
    require("xwind/plugins/important"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
  xwind: {
    mode: "objectstyles",
    classes: {
      entry: "./src",
      output: "./src/styles/xwind.css",
    },
  },
};
