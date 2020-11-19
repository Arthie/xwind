import Babel from "@babel/core";
import initClassUtilities from "@xwind/class-utilities";
import { getArgs } from "../transformUtils";

function transform(
  referencePaths: Babel.NodePath<Babel.types.Node>[],
  t: typeof Babel.types,
  twClassesUtils: ReturnType<typeof initClassUtilities>
) {
  const referencedTwClasses = [];
  for (const referencePath of referencePaths) {
    const args = getArgs(referencePath);
    const serializedTwClasses = twClassesUtils.serializer(args);
    referencePath.parentPath.replaceWith(t.stringLiteral(serializedTwClasses));
    referencedTwClasses.push(serializedTwClasses);
  }
  return twClassesUtils.serializer(referencedTwClasses);
}

export default transform;
