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
  getTemplateContextClassesFromTemplateContext,
  isPositionInTemplateContextClassRange,
  TemplateContextClass,
} from "./templateContextClass";
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
      generateTwClassSubstituteRoot: (
        twObjectMap: Map<string, TwObject>,
        twParsedClass: [string, string[]]
      ) => postcss.Root;
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

        logger.log("TEST");

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

        const templateContextClasses = getTemplateContextClassesFromTemplateContext(
          context,
          tailwindConfig?.separator ?? ":"
        );

        for (const templateContextClass of templateContextClasses) {
          if (problems > maxNumberOfProblems) break;
          if (!tailwindData.twObjectMap.has(templateContextClass.class.text)) {
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
          if (templateContextClass.variant) {
            //first:second:other
            const [
              first,
              second,
              ...other
            ] = templateContextClass.variant.text.split(
              tailwindConfig?.separator ?? ":"
            );

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

            if (other.length) {
              diagnostics.push({
                file: context.node.getSourceFile(),
                code: 3,
                category: ts.DiagnosticCategory.Error,
                start: templateContextClass.variant.index,
                length: templateContextClass.variant.text.length,
                messageText: `${templateContextClass.variant.text} is not a valid tailwind variant. The selector has more than 2 variants: ${other}.`,
                source: "tailwindcssinjs",
              });
              problems++;
              continue;
            }

            if (secondType && firstType === "variants") {
              diagnostics.push({
                file: context.node.getSourceFile(),
                code: 4,
                category: ts.DiagnosticCategory.Error,
                start: templateContextClass.variant.index,
                length: templateContextClass.variant.text.length,
                messageText: `${templateContextClass.variant.text} is not a valid tailwind variant. "${first}" should be a screen variant`,
                source: "tailwindcssinjs",
              });
              problems++;
              continue;
            }

            if (!firstType && !secondType) {
              diagnostics.push({
                file: context.node.getSourceFile(),
                code: 5,
                category: ts.DiagnosticCategory.Error,
                start: templateContextClass.variant.index,
                length: templateContextClass.variant.text.length,
                messageText: `${templateContextClass.variant.text} is not a tailwind variant.`,
                source: "tailwindcssinjs",
              });
              problems++;
              continue;
            }

            if (firstType === "screen" && secondType === "screen") {
              diagnostics.push({
                file: context.node.getSourceFile(),
                code: 6,
                category: ts.DiagnosticCategory.Error,
                start: templateContextClass.variant.index,
                length: templateContextClass.variant.text.length,
                messageText: `${templateContextClass.variant.text} is not a valid tailwind variant. "${second}" should be a variant, not a screen variant`,
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
        if (!tailwindData?.twObjectMap) {
          return {
            isGlobalCompletion: false,
            isMemberCompletion: false,
            isNewIdentifierLocation: false,
            entries: [],
          };
        }

        const templateContextClasses = getTemplateContextClassesFromTemplateContext(
          context,
          tailwindConfig?.separator ?? ":"
        );

        let templateContextClassPosition: TemplateContextClass | undefined;
        for (const templateContextClass of templateContextClasses) {
          if (
            isPositionInTemplateContextClassRange(
              position,
              templateContextClass.class.range
            )
          ) {
            templateContextClassPosition = templateContextClass;
            break;
          }
        }

        //todo add check for is tailwind class
        const entries: ts.CompletionEntry[] = [];
        for (const key of tailwindData.twObjectMap.keys()) {
          const entry = translateCompletionEntry({
            label: key,
            kind: vscode.CompletionItemKind.Keyword,
          });

          if (templateContextClassPosition) {
            // const isTailwindClass =
            //   templateContextClassPosition &&
            //   tailwindData.twObjectMap.has(
            //     templateContextClassPosition.class.text
            //   );
            const endsWithSeparator = templateContextClassPosition.class.text.endsWith(
              tailwindConfig?.separator ?? ":"
            );
            if (!endsWithSeparator) {
              entry.replacementSpan = {
                start: templateContextClassPosition.class.index,
                length: templateContextClassPosition.class.text.length,
              };
            }
          }

          entries.push(entry);
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
          return translateCompletionItemsToCompletionEntryDetails({
            label: name,
            kind: vscode.CompletionItemKind.Text,
            documentation: {
              kind: vscode.MarkupKind.Markdown,
              value: [
                "```css",
                twObject.root.toString().replace(/    /g, "  "),
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
        //TODO: improve duplicated code
        //cache twVariant objects
        if (!tailwindData) {
          return;
        }
        const templateContextClasses = getTemplateContextClassesFromTemplateContext(
          context,
          tailwindConfig?.separator ?? ":"
        );

        let templateContextClassPosition: TemplateContextClass | undefined;
        for (const templateContextClass of templateContextClasses) {
          if (
            isPositionInTemplateContextClassRange(
              position,
              templateContextClass.class.range
            )
          ) {
            templateContextClassPosition = templateContextClass;
            break;
          }
        }

        if (templateContextClassPosition) {
          let twObjectRoot;
          if (templateContextClassPosition.variant) {
            const variantClass = `${templateContextClassPosition.variant.text}${
              tailwindConfig?.separator ?? ":"
            }${templateContextClassPosition.class.text}`;
            const [twClass, ...variants] = variantClass
              .split(tailwindConfig?.separator ?? ":")
              .reverse();
            const parsedClass: [string, string[]] = [twClass, variants];
            twObjectRoot = tailwindData.generateTwClassSubstituteRoot(
              tailwindData.twObjectMap,
              parsedClass
            );
          } else {
            twObjectRoot = tailwindData.twObjectMap.get(
              templateContextClassPosition.class.text
            )?.root;
          }
          if (twObjectRoot) {
            return translateHoverItemsToQuickInfo({
              start: templateContextClassPosition.class.index,
              label: templateContextClassPosition.class.text,
              kind: vscode.CompletionItemKind.Text,
              documentation: {
                kind: vscode.MarkupKind.Markdown,
                value: [
                  "```css",
                  twObjectRoot.toString().replace(/    /g, "  "),
                  "```",
                ].join("\n"),
              },
            });
          }
        }

        let templateContextVariantPosition: TemplateContextClass | undefined;
        for (const templateContextClass of templateContextClasses) {
          if (
            templateContextClass.variant &&
            isPositionInTemplateContextClassRange(
              position,
              templateContextClass.variant.range
            )
          ) {
            templateContextVariantPosition = templateContextClass;
            break;
          }
        }

        if (templateContextVariantPosition?.variant) {
          const variantClass = `${templateContextVariantPosition.variant.text}${
            tailwindConfig?.separator ?? ":"
          }${templateContextVariantPosition.class.text}`;
          const [twClass, ...variants] = variantClass
            .split(tailwindConfig?.separator ?? ":")
            .reverse();
          const parsedClass: [string, string[]] = [twClass, variants];
          const variantTwObject = tailwindData.generateTwClassSubstituteRoot(
            tailwindData.twObjectMap,
            parsedClass
          );
          return translateHoverItemsToQuickInfo({
            start: templateContextVariantPosition.variant.index,
            label: templateContextVariantPosition.variant.text,
            kind: vscode.CompletionItemKind.Text,
            documentation: {
              kind: vscode.MarkupKind.Markdown,
              value: [
                "```css",
                variantTwObject.toString().replace(/    /g, "  "),
                "```",
              ].join("\n"),
            },
          });
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
