import {
  decorateWithTemplateLanguageService,
  Logger,
  TemplateContext,
  TemplateLanguageService,
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import * as vscode from "vscode-languageserver-types";
import { TwObject } from "@tailwindcssinjs/transformers";
import { TailwindConfig } from "@tailwindcssinjs/tailwindcss-data/lib/tailwindcssConfig";

import tailwindcssinjs, { requireTailwindConfig } from "./tailwindcssinjs";
import { createLogger } from "./logger";
import {
  TailwindContext,
  getTailwindContextFromPosition,
  getTailwindContextFromTemplateContext,
} from "./tailwindContext";
import {
  translateCompletionItemsToCompletionEntryDetails,
  translateCompletionEntry,
  translateHoverItemsToQuickInfo,
} from "./translate";
import postcss from "postcss";

let tailwindConfig: TailwindConfig | undefined;
let tailwindData:
  | {
      twObjectMap: Map<string, TwObject>;
      screens: string[];
      variants: string[];
      generateCssFromText: (text: string) => postcss.Root[];
    }
  | undefined;

let watcher: ts.FileWatcher | undefined;

function updateTailwindcssinjs(logger: Logger, configPath?: string) {
  try {
    logger.log(`CONFIG PATH:${configPath}`);
    if (configPath) {
      if (watcher) {
        watcher.close();
      }
      watcher = ts.sys.watchFile?.(
        configPath,
        (fileName: string, eventKind: ts.FileWatcherEventKind) => {
          logger.log(`Watchfile config update: ${configPath}`);
          updateTailwindcssinjs(logger, fileName);
        }
      );
    }
    tailwindConfig = requireTailwindConfig(logger, configPath);
    tailwindData = tailwindcssinjs(tailwindConfig);
  } catch (err) {
    logger.log(`ERROR: ${err}`);
  }
}

function tailwindcssinjsLanguageService(
  info: ts.server.PluginCreateInfo,
  logger: Logger
): TemplateLanguageService {
  try {
    updateTailwindcssinjs(logger, info.config?.config);

    return {
      getSyntacticDiagnostics(context: TemplateContext): ts.Diagnostic[] {
        if (!tailwindData) {
          return [];
        }
        const maxNumberOfProblems = 100;
        let problems = 0;
        const diagnostics: ts.Diagnostic[] = [];

        //TODO improve this regex
        const NESTED_VARIANT_REGEXP = /(\[([^\[\]]){0,}\[[^\]]{0,}\][^\]]{0,}\])|(\[([^\[\]]){0,}\[)|(\]([^\[\]]){0,}\])/;

        const nestedMath = context.text.match(NESTED_VARIANT_REGEXP);

        if (nestedMath?.length) {
          problems++;
          let diagnostic: ts.Diagnostic = {
            file: context.node.getSourceFile(),
            code: 1,
            category: ts.DiagnosticCategory.Error,
            start: nestedMath.index,
            length: nestedMath[0].length,
            messageText: `Nested variants arrays are not allowed.`,
            source: "tailwindcssinjs",
          };
          diagnostics.push(diagnostic);
        }

        const tailwindContext = getTailwindContextFromTemplateContext(
          context,
          tailwindConfig?.separator ?? ":"
        );

        for (const templateContextClass of tailwindContext) {
          if (problems > maxNumberOfProblems) break;

          if (templateContextClass.type === "array") {
            for (const twClass of templateContextClass.classes) {
              const twObject = tailwindData.twObjectMap.get(twClass.text);
              if (!twObject) {
                diagnostics.push({
                  file: context.node.getSourceFile(),
                  code: 2,
                  category: ts.DiagnosticCategory.Error,
                  start: twClass.index,
                  length: twClass.text.length,
                  messageText: `${twClass.text} is not a tailwind class.`,
                  source: "tailwindcssinjs",
                });
                problems++;
              }
            }
          }

          if (templateContextClass.type === "variant") {
            const twObject = tailwindData.twObjectMap.get(
              templateContextClass.class.text
            );
            if (!twObject) {
              diagnostics.push({
                file: context.node.getSourceFile(),
                code: 2,
                category: ts.DiagnosticCategory.Error,
                start: templateContextClass.class.index,
                length: templateContextClass.class.text.length,
                messageText: `${templateContextClass.class.text} is not a tailwind class.`,
                source: "tailwindcssinjs",
              });
              problems++;
            }
          }

          if (templateContextClass.type === "class") {
            if (!tailwindData.twObjectMap.has(templateContextClass.text)) {
              diagnostics.push({
                file: context.node.getSourceFile(),
                code: 5,
                category: ts.DiagnosticCategory.Error,
                start: templateContextClass.index,
                length: templateContextClass.text.length,
                messageText: `${templateContextClass.text} is not a tailwind class.`,
                source: "tailwindcssinjs",
              });
              problems++;
            }
          }

          if (
            templateContextClass.type === "array" ||
            templateContextClass.type === "variant"
          ) {
            //first:second:...other
            const [first, second, ...other] = templateContextClass.variant;

            const getVariantType = (variant?: string) => {
              if (variant) {
                if (tailwindData?.screens.includes(variant)) {
                  return "screen";
                }
                if (tailwindData?.variants.includes(variant)) {
                  return "variants";
                }
              }
            };

            const firstType = getVariantType(first);
            const secondType = getVariantType(second);

            // if (other.length) {
            //   diagnostics.push({
            //     file: context.node.getSourceFile(),
            //     code: 6,
            //     category: ts.DiagnosticCategory.Error,
            //     start: templateContextClass.index,
            //     length: templateContextClass.variant.join(
            //       tailwindConfig?.separator ?? ":"
            //     ).length,
            //     messageText: `${templateContextClass.variant.join(
            //       tailwindConfig?.separator ?? ":"
            //     )} is not a valid tailwind variant. The selector has more than 2 variants: ${other}.`,
            //     source: "tailwindcssinjs",
            //   });
            //   problems++;
            //   continue;
            // }

            // if (secondType && firstType === "variants") {
            //   diagnostics.push({
            //     file: context.node.getSourceFile(),
            //     code: 7,
            //     category: ts.DiagnosticCategory.Error,
            //     start: templateContextClass.index,
            //     length: templateContextClass.variant.join(
            //       tailwindConfig?.separator ?? ":"
            //     ).length,
            //     messageText: `${templateContextClass.variant.join(
            //       tailwindConfig?.separator ?? ":"
            //     )} is not a valid tailwind variant. "${first}" should be a screen variant`,
            //     source: "tailwindcssinjs",
            //   });
            //   problems++;
            //   continue;
            // }

            if (!firstType && !secondType) {
              diagnostics.push({
                file: context.node.getSourceFile(),
                code: 8,
                category: ts.DiagnosticCategory.Error,
                start: templateContextClass.index,
                length: templateContextClass.variant.join(
                  tailwindConfig?.separator ?? ":"
                ).length,
                messageText: `${templateContextClass.variant.join(
                  tailwindConfig?.separator ?? ":"
                )} is not a tailwind variant.`,
                source: "tailwindcssinjs",
              });
              problems++;
              continue;
            }

            if (firstType === "screen" && secondType === "screen") {
              diagnostics.push({
                file: context.node.getSourceFile(),
                code: 9,
                category: ts.DiagnosticCategory.Error,
                start: templateContextClass.index,
                length: templateContextClass.variant.join(
                  tailwindConfig?.separator ?? ":"
                ).length,
                messageText: `${templateContextClass.variant.join(
                  tailwindConfig?.separator ?? ":"
                )} is not a valid tailwind variant. "${second}" should be a variant, not a screen variant`,
                source: "tailwindcssinjs",
              });
              problems++;
              continue;
            }
          }
        }

        return diagnostics;
      },
      getCompletionsAtPosition(
        context: TemplateContext,
        position: ts.LineAndCharacter
      ): ts.CompletionInfo {
        if (!tailwindData) {
          return {
            isGlobalCompletion: false,
            isMemberCompletion: false,
            isNewIdentifierLocation: false,
            entries: [],
          };
        }

        const tailwindContexts = getTailwindContextFromTemplateContext(
          context,
          tailwindConfig?.separator ?? ":"
        );

        const twContext = getTailwindContextFromPosition(
          tailwindContexts,
          position
        );

        //todo add check for is tailwind class
        const entries: ts.CompletionEntry[] = [];
        for (const key of tailwindData.twObjectMap.keys()) {
          const entry = translateCompletionEntry({
            label: key,
            kind: vscode.CompletionItemKind.Text,
          });

          if (twContext) {
            if (twContext.type === "array") {
              const twContextClass = getTailwindContextFromPosition(
                twContext.classes,
                position
              );
              if (twContextClass) {
                entry.replacementSpan = {
                  start: twContextClass.index,
                  length: twContextClass.text.length,
                };
              }
            } else {
              const endsWithSeparator = twContext.text.endsWith(
                tailwindConfig?.separator ?? ":"
              );
              if (!endsWithSeparator) {
                entry.replacementSpan = {
                  start: twContext.index,
                  length: twContext.text.length,
                };
              }
            }
          }
          entries.push(entry);
        }

        for (const variant of [
          ...tailwindData.screens,
          ...tailwindData.variants,
        ]) {
          const variantEntry = translateCompletionEntry({
            label: variant,
            kind: vscode.CompletionItemKind.Function,
          });
          entries.push(variantEntry);
        }

        return {
          isGlobalCompletion: false,
          isMemberCompletion: false,
          isNewIdentifierLocation: false,
          entries: entries,
        };
      },
      getCompletionEntryDetails(
        context: TemplateContext,
        position: ts.LineAndCharacter,
        name: string
      ): ts.CompletionEntryDetails {
        if (!tailwindData) {
          return {
            displayParts: [],
            kind: ts.ScriptElementKind.unknown,
            kindModifiers: "",
            name,
          };
        }

        const twObject = tailwindData.twObjectMap.get(name);
        if (twObject) {
          const root = postcss.root().append(...twObject.nodes);
          return translateCompletionItemsToCompletionEntryDetails({
            label: name,
            kind: vscode.CompletionItemKind.Text,
            documentation: {
              kind: vscode.MarkupKind.Markdown,
              value: [
                "```css",
                root.toString().replace(/    /g, "  "),
                "```",
              ].join("\n"),
            },
          });
        }
        return {
          displayParts: [],
          kind: ts.ScriptElementKind.unknown,
          kindModifiers: "",
          name,
        };
      },
      getQuickInfoAtPosition(
        context: TemplateContext,
        position: ts.LineAndCharacter
      ): ts.QuickInfo | undefined {
        if (!tailwindData) {
          return;
        }

        const tailwindContexts = getTailwindContextFromTemplateContext(
          context,
          tailwindConfig?.separator ?? ":"
        );

        const twContext = getTailwindContextFromPosition(
          tailwindContexts,
          position
        );

        const getQuickInfo = (
          twContext: TailwindContext,
          twObjectRoots: postcss.Root[]
        ) => {
          return translateHoverItemsToQuickInfo({
            start: twContext.index,
            label: twContext.text,
            kind: vscode.CompletionItemKind.Text,
            documentation: {
              kind: vscode.MarkupKind.Markdown,
              value: [
                "```css",
                ...twObjectRoots.map((twObjectRoot: postcss.Root) => [
                  twObjectRoot.toString().replace(/    /g, "  "),
                ]),
                "```",
              ].join("\n"),
            },
          });
        };

        if (twContext) {
          const twObjectRoots = tailwindData.generateCssFromText(
            twContext.text
          );
          return getQuickInfo(twContext, twObjectRoots);
        }
      },
    };
  } catch (err) {
    logger.log(`ERROR: ${err}`);
    throw err;
  }
}

interface PluginConfig {
  config: string;
}

export = (mod: { typescript: typeof ts }): ts.server.PluginModule => {
  let logger: Logger;
  return {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService {
      logger = createLogger(info);
      logger.log("TailwindcssinjsTsPlugin is starting.");
      return decorateWithTemplateLanguageService(
        mod.typescript,
        info.languageService,
        info.project,
        tailwindcssinjsLanguageService(info, logger),
        { tags: ["tw"] },
        { logger }
      );
    },
    onConfigurationChanged(pluginConfig: PluginConfig) {
      if (logger) {
        logger.log(
          `Config has changed ${typeof pluginConfig} ${JSON.stringify(
            pluginConfig
          )}`
        );
      }
      updateTailwindcssinjs(logger, pluginConfig.config);
    },
  };
};
