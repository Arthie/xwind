import {
  tailwindData,
  resolveTailwindConfig,
} from "@tailwindcssinjs/tailwindcss-data";

import {
  transformPostcssRootToTwObjects,
  transformTwObjectsToTwStyleObjectMap,
} from "@tailwindcssinjs/transformers";
import {
  CompletionItem,
  MarkupContent,
  MarkupKind,
  CompletionItemKind,
} from "vscode-languageserver";

export const tailwindcssInJs = () => {
  const config = resolveTailwindConfig();
  const { componentsRoot, utilitiesRoot, resolvedConfig } = tailwindData(
    config
  );

  const transformedComponents = transformPostcssRootToTwObjects(
    componentsRoot,
    "components"
  );
  const transformedUtilities = transformPostcssRootToTwObjects(
    utilitiesRoot,
    "utilities"
  );

  const mappedTwCssObjects = transformTwObjectsToTwStyleObjectMap([
    ...transformedComponents,
    ...transformedUtilities,
  ]);

  const tailwindEntries: CompletionItem[] = [];
  for (const [key, twcssobj] of mappedTwCssObjects) {
    const color = twcssobj.styleObject?.color as string;

    const styleString = JSON.stringify(twcssobj.styleObject, undefined, 2);

    let markdown: MarkupContent = {
      kind: MarkupKind.Markdown,
      value: ["```typescript", styleString, "```"].join("\n"),
    };

    tailwindEntries.push({
      label: key,
      kind: color ? CompletionItemKind.Color : CompletionItemKind.Keyword,
      detail: color ? styleString : key,
      documentation: color ? color : markdown,
    });
  }

  return { mappedTwCssObjects, tailwindEntries, resolvedConfig };
};
