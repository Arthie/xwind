import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
} from "vscode-languageserver";

import { TextDocument, Position } from "vscode-languageserver-textdocument";

import { tailwindcssInJs } from "./tailwindcssinjs";

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    serverInfo: {
      name: "tailwindcssinjs",
      version: "1.0.0",
    },
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      // Tell the client that the server supports code completion
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ["`", " ", "[", tailwind.resolvedConfig.separator],
      },
      //hoverProvider: true,
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.tailwindcssinjs || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "tailwindcssinjs",
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

let tailwind = tailwindcssInJs();

export interface Tags {
  text: string;
  index: number;
  range: {
    start: Position;
    end: Position;
  };
}

// Cache the settings of all open documents
const documentTags: Map<string, Tags[]> = new Map();

function getDocumentTags(
  resource: string,
  textDocument?: TextDocument
): Tags[] {
  let result = documentTags.get(resource);
  if (textDocument) {
    result = updateTags(textDocument);
    documentTags.set(resource, result);
  }
  return result ?? [];
}

function updateTags(textDocument: TextDocument) {
  const text = textDocument.getText();
  const patternTag = /(tw`)([^`]*)+`/g;
  const tags: Tags[] = [];
  let tag: RegExpExecArray | null;
  while ((tag = patternTag.exec(text))) {
    const index = tag.index + "tw`".length;
    const tagx = {
      text: tag[2],
      index,
      range: {
        start: textDocument.positionAt(index),
        end: textDocument.positionAt(index + tag[2].length),
      },
    };

    tags.push(tagx);
  }
  return tags;
}

function getTag(
  textDocumentPosition: TextDocumentPositionParams,
  tags: Tags[]
) {
  for (const tag of tags) {
    const tagStartLine = tag.range.start.line;
    const tagEndLine = tag.range.end.line;
    const tagStartCharacter = tag.range.start.character;
    const tagEndCharacter = tag.range.end.character;
    const line = textDocumentPosition.position.line;
    const character = textDocumentPosition.position.character;
    let insideLine = false;
    let insideChar = false;
    if (
      (line === tagStartLine && character >= tagStartCharacter) ||
      line > tagStartLine
    ) {
      insideLine = true;
    }
    if (
      (line === tagEndLine && character <= tagEndCharacter) ||
      line < tagEndLine
    ) {
      insideChar = true;
    }
    if (insideLine && insideChar) {
      return tag;
    }
  }
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const settings = await getDocumentSettings(textDocument.uri);

  const tags = getDocumentTags(textDocument.uri, textDocument);

  let patternClass = /[^\s\[\]]+/g;
  let m: RegExpExecArray | null;
  let problems = 0;
  let diagnostics: Diagnostic[] = [];

  for (const n of tags) {
    while (
      (m = patternClass.exec(n.text)) &&
      problems < settings.maxNumberOfProblems
    ) {
      let tailwindClass = tailwind.mappedTwCssObjects.has(
        m[0].split(tailwind.resolvedConfig.separator ?? ":").reverse()[0]
      );
      let variantArrayClass = m.input[m.index + m[0].length] === "[";

      if (!tailwindClass && !variantArrayClass && m[0] !== "tw") {
        problems++;

        let diagnostic: Diagnostic = {
          severity: DiagnosticSeverity.Error,
          range: {
            start: textDocument.positionAt(n.index + m.index),
            end: textDocument.positionAt(n.index + m.index + m[0].length),
          },
          message: `${m[0]} is not a tailwind class.`,
          source: "tailwindcssinjs",
        };
        diagnostics.push(diagnostic);
      }
    }

    const NESTED_VARIANT_REGEXP = /(\[([^\[\]]){0,}\[)|(\]([^\[\]]){0,}\])/g;

    while (
      (m = NESTED_VARIANT_REGEXP.exec(n.text)) &&
      problems < settings.maxNumberOfProblems
    ) {
      problems++;
      let diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: textDocument.positionAt(n.index + m.index),
          end: textDocument.positionAt(n.index + m.index + m[0].length),
        },
        message: `${m[0]} nested variants arrays are not allowed.`,
        source: "tailwindcssinjs",
      };
      diagnostics.push(diagnostic);
    }
  }

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log("We received an 'tailwind.config.js' change event");
  // Revalidate all open text documents
  tailwind = tailwindcssInJs();
  documents.all().forEach(validateTextDocument);
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    const document = documents.get(textDocumentPosition.textDocument.uri);
    if (!document) return [];

    const tags = getDocumentTags(textDocumentPosition.textDocument.uri);

    //check if current position is in a tag
    const tag = getTag(textDocumentPosition, tags);
    if (!tag) return [];

    //filter out classes already in tag
    //check variants
    // return tailwind.tailwindEntries.filter(
    // 	(item) => !tag.text.split(/[^\s\[\]]+/g).includes(item.label)
    // );
    return tailwind.tailwindEntries;
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => item);

/*
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.textDocument.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.textDocument.text the initial full content of the document.
	connection.console.log(`${params.textDocument.uri} opened.`);
});
connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.textDocument.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});
connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.textDocument.uri uniquely identifies the document.
	connection.console.log(`${params.textDocument.uri} closed.`);
});
*/

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
