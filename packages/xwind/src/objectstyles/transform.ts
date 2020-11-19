import Babel from "@babel/core";
import { getArgs } from "../transformUtils";
import initTailwindObjectstyles from "./tailwind";

function transform(
  referencePaths: Babel.NodePath<Babel.types.Node>[],
  t: typeof Babel.types,
  tailwindObjectStyle: ReturnType<typeof initTailwindObjectstyles>
) {
  for (const referencePath of referencePaths) {
    const args = getArgs(referencePath);
    const style = tailwindObjectStyle(args);
    referencePath.parentPath.replaceWith(t.valueToNode(style));
  }
}

export default transform;
