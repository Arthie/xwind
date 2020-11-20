import plugin from "tailwindcss/plugin";

//@ts-expect-error
const base = plugin(function ({ addBase, addUtilities, e, theme, variants }) {
  const style = {
    "*": {
      "--tw-shadow": "0 0 #0000",
      "--tw-ring-inset": "var(--tw-empty,/*!*/ /*!*/)",
      "--tw-ring-offset-width": "0px",
      "--tw-ring-offset-color": "#fff",
      "--tw-ring-color": "rgba(59, 130, 246, 0.5)",
      "--tw-ring-offset-shadow": "0 0 #0000",
      "--tw-ring-shadow": "0 0 #0000",
    },
  };
  addBase(style);
  const keyframesConfig = theme("keyframes");
  const keyframesStyles = Object.fromEntries(
    Object.entries(keyframesConfig).map(([name, keyframes]) => {
      return [`@keyframes ${name}`, keyframes];
    })
  );
  addBase(keyframesStyles);
});

export default base;
