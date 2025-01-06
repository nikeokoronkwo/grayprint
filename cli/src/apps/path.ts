import { basename, extname, isAbsolute, join, relative } from "jsr:@std/path";
import { TemplateBuiltConfig } from "../utils/config.ts";
import { Application } from "./base.ts";
import { walkSync } from "jsr:@std/fs/walk";

export class PathApplication<
  T extends TemplateBuiltConfig = TemplateBuiltConfig,
> extends Application<T> {
  override copyDir(from: string, dest: string): void {
    for (
      const file of walkSync(isAbsolute(from) ? from : join(this.cwd, from), {
        includeDirs: false,
      })
    ) {
      Deno.copyFileSync(
        file.path,
        join(
          isAbsolute(dest) ? dest : join(this.cwd, dest),
          relative(from, file.path),
        ),
      );
    }
  }

  override copyFile(from: string, dest: string): void {
    const destName = extname(dest) === "" && extname(dest) !== extname(from)
      ? join(dest, basename(from))
      : dest;
    Deno.copyFileSync(
      from,
      isAbsolute(destName) ? destName : join(this.cwd, destName),
    );
  }
}
