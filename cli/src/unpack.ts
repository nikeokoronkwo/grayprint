import { BaseTemplate } from "@grayprint/core";
import { ScopedParts, TemplateIdentifier, TemplateType } from "./plugin.ts";
import { loadGithubDir } from "./apps/github.ts";

export async function unpackTemplate(
  template: BaseTemplate,
  parsedTempl: TemplateIdentifier | undefined,
  arg2: { cwd: string },
) {
  switch (parsedTempl?.type ?? TemplateType.Core) {
    case TemplateType.Github: {
      const info = parsedTempl?.type as ScopedParts | undefined;
      const d = await loadGithubDir(info!.scope!, info!.name);
      if (typeof d === "string") {
        throw new Error("Unexpected value from `loadGithubDir`");
      }

      await d.dump(arg2.cwd);
      break;
    }
    case TemplateType.Core:
    case TemplateType.Builtin:
    case TemplateType.Path:
    case TemplateType.NPM:
    case TemplateType.JSR:
      throw new Error(
        "Unpacking has not been implemented for the given template type",
      );
  }
}
