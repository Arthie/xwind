import plugin from "tailwindcss/plugin";

const base = plugin(function ({
  addBase,
  addUtilities,
  e,
  theme,
  variants,
  config,
}: any) {
  const baseCSS = {
    "*": {
      "--tw-shadow": "0 0 #0000",
      "--tw-ring-inset": "var(--tw-empty,/*!*/ /*!*/)",
      "--tw-ring-offset-width": "0px",
      "--tw-ring-offset-color": "#fff",
      "--tw-ring-color": "rgba(59, 130, 246, 0.5)",
      "--tw-ring-offset-shadow": "0 0 #0000",
      "--tw-ring-shadow": "0 0 #0000",
    },
    "@keyframes spin": { to: { transform: "rotate(360deg)" } },
    "@keyframes ping": { "75%, 100%": { transform: "scale(2)", opacity: 0 } },
    "@keyframes pulse": { "50%": { opacity: 0.5 } },
    "@keyframes bounce": {
      "0%, 100%": {
        transform: "translateY(-25%)",
        animationTimingFunction: "cubic-bezier(0.8,0,1,1)",
      },
      "50%": {
        transform: "none",
        animationTimingFunction: "cubic-bezier(0,0,0.2,1)",
      },
    },
  };

  addBase(baseCSS);
});

export default base;
