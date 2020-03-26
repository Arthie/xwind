import {
  decorateWithTemplateLanguageService,
  Logger as TplLanguageLogger,
  TemplateContext,
  TemplateLanguageService,
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import * as vscode from "vscode-languageserver-types";

import { tailwindcssInJs } from "./tailwindcssinjs";
import { TwCssObject } from "@tailwindcssinjs/transformers";

class Logger implements TplLanguageLogger {
  constructor(private readonly info: ts.server.PluginCreateInfo) {}

  public log(msg: string): void {
    this.info.project.projectService.logger.info(
      `>> [TAILWINDCSSINJSTSPLUGIN] ${msg}`
    );
  }
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

class TailwindcssinjsLanguageService implements TemplateLanguageService {
  constructor(
    private readonly info: ts.server.PluginCreateInfo,
    private readonly logger: Logger,
    private readonly tailwind: Map<string, TwCssObject>
  ) {}

  public getCompletionsAtPosition(
    context: TemplateContext,
    position: ts.LineAndCharacter
  ): ts.WithMetadata<ts.CompletionInfo> {
    const line = context.text.split(/\n/g)[position.line];
    this.logger.log(`Line is: ${line}`);
    this.logger.log(`RAW TEXT ${context.rawText}`);
    this.logger.log(`TEXT ${context.text}`);
    this.logger.log(`RAW POSITION ${JSON.stringify(position)}`);
    this.logger.log(`${context.node}`);
    this.logger.log(`${position.line} / ${position.character}`);

    const entries: ts.CompletionEntry[] = [];

    for (const [key, twcssobj] of this.tailwind) {
      entries.push({
        kind: ts.ScriptElementKind.string,
        kindModifiers: "",
        name: key,
        sortText: "",
      });
    }

    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries,
    };
  }

  // public getCompletionEntryDetails(context: TemplateContext, position: ts.LineAndCharacter, name: string): ts.CompletionEntryDetails {
  //   const line = context.text.split(/\n/g)[position.line];
  //   this.logger.log(`Line is: ${line}`);
  //   this.logger.log(`${context.rawText} / ${context.text}`);
  //   this.logger.log(`${position.line} / ${position.character}`);

  //   console.log("hah", this.tailwind)
  //   const value = this.tailwind.get(name)
  //   const text = formatio.ascii(value ? value.cssObject : {})
  //   return {
  //     name: name,
  //     kind: ts.ScriptElementKind.unknown,
  //     kindModifiers: "ts-tailwindcssinjs-plugin",
  //     displayParts: [{
  //       text,
  //       kind: ts.ScriptElementKind.keyword
  //     },
  //     ],
  //   }
  // }
}

/**
 * A plugin can be either a class or functions following the Decorator Pattern
 */
class TailwindcssinjsTsPlugin {
  /**
   * Typically no operation have to be done in constructor.
   */
  constructor(private readonly typescript: typeof ts) {
    /* no op */
  }

  /**
   * This is the main entrypoint of your plugin.
   */
  public create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const logger = new Logger(info);
    logger.log("TailwindcssinjsTsPlugin is starting.");

    const tailwind = tailwindcssInJs();

    info.languageService.getCompletionsAtPosition = (
      fileName: string,
      position: number,
      options: ts.GetCompletionsAtPositionOptions | undefined
    ): ts.WithMetadata<ts.CompletionInfo> | undefined => {
      console.log(fileName, position, options);
      return {
        entries: [
          { name: "test", kind: ts.ScriptElementKind.string, sortText: "" },
        ],
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
        metadata: "",
      };
    };

    return decorateWithTemplateLanguageService(
      this.typescript,
      info.languageService,
      info.project,
      new TailwindcssinjsLanguageService(info, logger, tailwind),
      { tags: ["tw"], enableForStringWithSubstitutions: true },
      { logger }
    );
  }
}

export = (mod: { typescript: typeof ts }) =>
  new TailwindcssinjsTsPlugin(mod.typescript);
