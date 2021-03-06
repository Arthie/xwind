import { Container } from "postcss";
import plugin from "tailwindcss/plugin";

const important = plugin(
  ({ addVariant, addComponents, e, prefix, config }: any) => {
    addVariant("important", ({ container }: { container: Container }) => {
      container.walkRules((rule) => {
        rule.selector = `.important\\${config().separator}${rule.selector.slice(
          1
        )}`;
        rule.walkDecls((decl) => {
          decl.important = true;
        });
      });
    });
  }
);

export default important;
