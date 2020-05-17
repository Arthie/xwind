import { Logger } from "typescript-template-language-service-decorator";

export function createLogger(info: ts.server.PluginCreateInfo): Logger {
  return {
    log(msg: string): void {
      info.project.projectService.logger.info(
        `>> [TAILWINDCSSINJSTSPLUGIN] ${msg}`
      );
    },
  };
}
