import Babel from "@babel/core";

export function getArgs(referencePath: Babel.NodePath<Babel.types.Node>) {
  if (!referencePath.isIdentifier()) {
    throw new Error("Reference path is not identifier");
  }

  const twClasses: string[][] = [];

  const path = referencePath.parentPath;
  if (path.isCallExpression()) {
    const argumentPaths = path.get("arguments");
    if (Array.isArray(argumentPaths)) {
      for (const argumentPath of argumentPaths) {
        const { confident, value } = argumentPath.evaluate();
        if (!confident)
          throw new Error(
            `Value of "${argumentPath.getSource()}" could not be statically evaluated.`
          );
        twClasses.push(value);
      }
    }
  }

  if (path.isTaggedTemplateExpression()) {
    const quasiPath = path.get("quasi");
    if (!Array.isArray(quasiPath)) {
      const { confident, value } = quasiPath.evaluate();
      if (!confident)
        throw new Error(
          `Value of "${quasiPath.getSource()}" could not be statically evaluated.`
        );
      twClasses.push(value);
    }
  }

  return twClasses;
}
