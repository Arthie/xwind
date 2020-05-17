import * as vscode from "vscode-languageserver-types";
import * as ts from "typescript/lib/tsserverlibrary";

// function translateCompletionItemsToCompletionInfo(
//   items: vscode.CompletionList
// ): ts.WithMetadata<ts.CompletionInfo> {
//   return {
//     metadata: {
//       isIncomplete: items.isIncomplete,
//     },
//     isGlobalCompletion: false,
//     isMemberCompletion: false,
//     isNewIdentifierLocation: false,
//     entries: items.items.map((x) => translateCompetionEntry(x)),
//   };
// }

export function translateCompletionItemsToCompletionEntryDetails(
  item: vscode.CompletionItem
): ts.CompletionEntryDetails {
  return {
    name: item.label,
    kind: translateCompletionItemKind(item.kind),
    kindModifiers: getKindModifiers(item.kind),
    displayParts: toDisplayParts(item.detail),
    documentation: toDisplayParts(item.documentation),
    tags: [],
  };
}

interface HoverItem extends vscode.CompletionItem {
  start: number;
}

export function translateHoverItemsToQuickInfo(item: HoverItem): ts.QuickInfo {
  return {
    textSpan: {
      start: item.start,
      length: item.label.length,
    },
    kind: translateCompletionItemKind(item.kind),
    kindModifiers: getKindModifiers(item.kind),
    displayParts: toDisplayParts(item.detail),
    documentation: toDisplayParts(item.documentation),
    tags: [],
  };
}

export function translateCompletionEntry(
  item: vscode.CompletionItem
): ts.CompletionEntry {
  return {
    name: item.label,
    kind: translateCompletionItemKind(item.kind),
    kindModifiers: getKindModifiers(item.kind),
    sortText: item.sortText || item.label,
  };
}

function translateCompletionItemKind(
  kind?: vscode.CompletionItemKind
): ts.ScriptElementKind {
  switch (kind) {
    case vscode.CompletionItemKind.Method:
      return ts.ScriptElementKind.memberFunctionElement;
    case vscode.CompletionItemKind.Function:
      return ts.ScriptElementKind.functionElement;
    case vscode.CompletionItemKind.Constructor:
      return ts.ScriptElementKind.constructorImplementationElement;
    case vscode.CompletionItemKind.Field:
    case vscode.CompletionItemKind.Variable:
      return ts.ScriptElementKind.variableElement;
    case vscode.CompletionItemKind.Class:
      return ts.ScriptElementKind.classElement;
    case vscode.CompletionItemKind.Interface:
      return ts.ScriptElementKind.interfaceElement;
    case vscode.CompletionItemKind.Module:
      return ts.ScriptElementKind.moduleElement;
    case vscode.CompletionItemKind.Property:
      return ts.ScriptElementKind.memberVariableElement;
    case vscode.CompletionItemKind.Unit:
    case vscode.CompletionItemKind.Value:
      return ts.ScriptElementKind.constElement;
    case vscode.CompletionItemKind.Enum:
      return ts.ScriptElementKind.enumElement;
    case vscode.CompletionItemKind.Keyword:
      return ts.ScriptElementKind.keyword;
    case vscode.CompletionItemKind.Color:
      return ts.ScriptElementKind.constElement;
    case vscode.CompletionItemKind.Reference:
      return ts.ScriptElementKind.alias;
    case vscode.CompletionItemKind.File:
      return ts.ScriptElementKind.moduleElement;
    case vscode.CompletionItemKind.Snippet:
    case vscode.CompletionItemKind.Text:
    default:
      return ts.ScriptElementKind.unknown;
  }
}

function getKindModifiers(kind?: vscode.CompletionItemKind): string {
  return kind === vscode.CompletionItemKind.Color ? "color" : "";
}

function toDisplayParts(
  text: string | vscode.MarkupContent | undefined
): ts.SymbolDisplayPart[] {
  if (!text) {
    return [];
  }
  return [
    {
      kind: "text",
      text: typeof text === "string" ? text : text.value,
    },
  ];
}
