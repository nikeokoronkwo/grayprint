// @deno-types="npm:@types/prompts@^2.4.9"
import prompt from "npm:prompts@^2.4.2";
import {
  BaseTemplate,
  BaseTool,
  BaseToolOptions,
  DotEnvOptions,
  TemplateBuiltContext,
  TemplateConfig,
  TemplateContext,
  TemplateEnv,
  TemplateOptions,
  TemplatePackageInterface,
  TemplatePaths,
  TemplateToolContext,
} from "@grayprint/core";
import { optionToPrompt } from "./template/questionnaire.ts";
import { Runtime } from "./template/runtimes.ts";
import { TemplateEnvImpl } from "./context/env.ts";
import { copySync, existsSync } from "jsr:@std/fs";
import { getCommandsForPackageManager } from "./context/commands.ts";
import { PackageManager } from "./context/package_manager.ts";
import {
  ESLintTool,
  PrettierTool,
  SassTool,
  TailwindTool,
} from "../../packages/core/builtin.ts";
import tailwind from "./tools/tailwind.ts";
import prettier from "./tools/prettier.ts";
import sass from "./tools/sass.ts";
import eslint from "./tools/eslint.ts";
import { isAbsolute, join } from "jsr:@std/path@^1.0.8";
import { execFileSync } from "node:child_process";

export function buildTemplatePreContext(template: BaseTemplate, options: {
  packageManager: PackageManager;
  runtime: Runtime;
  config: TemplateConfig<typeof template.options>;
  name: string;
}): TemplateContextImpl<typeof template> {
  return new TemplateContextImpl({
    ...options,
    template,
  });
}

class TemplateContextImpl<T extends BaseTemplate>
  implements TemplateContext<T["options"]> {
  name: string;

  config: TemplateConfig<T["options"]>;

  packageManager: PackageManager;

  runtime: Runtime;

  //deno-lint-ignore no-explicit-any
  configFile: Record<string, any> = {};

  cwd?: string;

  protected _templ: T;

  constructor(options: {
    template: T;
    packageManager: PackageManager;
    runtime: Runtime;
    config: TemplateConfig<T["options"]>;
    name: string;
    cwd?: string;
  }) {
    this._templ = options.template;
    this.name = options.name;
    this.runtime = options.runtime;
    this.config = options.config;
    this.packageManager = options.packageManager;
    this.cwd = options.cwd ?? Deno.cwd();
  }

  async question(q: TemplateOptions): Promise<string | boolean | string[]> {
    const option = optionToPrompt(q);

    const answer = await prompt(option);
    return Object.values(answer)[0];
  }

  log = console.log;
  error = console.error;

  upgradeContext(dir: string, options: {
    //deno-lint-ignore no-explicit-any
    beforeCreateCtx: Record<string, any>;
    outputDir?: string;
    typescript?: boolean;
    git?: boolean;
  }): TemplateBuiltContextImpl<T> {
    return new TemplateBuiltContextImpl(this, {
      template: this._templ,
      dir,
      beforeCreateCtx: options.beforeCreateCtx,
      outputDir: options.outputDir,
    });
  }
}

class TemplateBuiltContextImpl<T extends BaseTemplate>
  extends TemplateContextImpl<T>
  implements TemplateBuiltContext<T["options"]> {
  private _templateDir: string;
  private _outputDir: string;
  private dotEnvContext: Record<string, Map<string, string>> = {};
  private _typescript?: boolean;
  private _git?: boolean;

  packageJsonRecord: Record<string, string> = {};

  env: TemplateEnv = new TemplateEnvImpl();

  //deno-lint-ignore no-explicit-any
  ctx: Record<string, any>;

  get typescript(): boolean {
    /** @todo can we infer from the template itself??? */
    return this._typescript ?? this.config?.typescript ?? false;
  }

  get git(): boolean {
    return this._git ?? this.config?.git ?? false;
  }

  get templateDir(): string {
    return this._templateDir;
  }

  constructor(impl: TemplateContextImpl<T>, options: {
    template: T;
    dir: string;
    //deno-lint-ignore no-explicit-any
    beforeCreateCtx: Record<string, any>;
    outputDir?: string;
    typescript?: boolean;
    git?: boolean;
  }) {
    super({
      template: options.template,
      ...impl,
    });
    this._templateDir = options.dir;
    this.ctx = options.beforeCreateCtx;
    const outDir = options.outputDir ?? Deno.cwd();
    this._outputDir = outDir;
    this._typescript = options.typescript;
    this._git = options.git;
    this.path = {
      ROOT: outDir,
    };
    this.packages = getCommandsForPackageManager(this.packageManager, outDir);
  }
  path: TemplatePaths;

  dotEnv(key: string, options?: DotEnvOptions): string | undefined;
  dotEnv(key: string, value?: string, options?: DotEnvOptions): string;

  dotEnv(
    key: string,
    valueOrOptions?: string | DotEnvOptions,
    maybeOptions?: DotEnvOptions,
  ): string | undefined {
    const options = (typeof valueOrOptions === "object")
      ? valueOrOptions
      : maybeOptions;
    const dotEnv = `.env${options?.type ? `.${options.type}` : ""}`;

    if (!this.dotEnvContext[dotEnv]) {
      this.dotEnvContext[dotEnv] = new Map();
    }

    if (valueOrOptions && typeof valueOrOptions === "string") {
      this.dotEnvContext[dotEnv].set(key, valueOrOptions);
    }

    return this.dotEnvContext[dotEnv].get(key);
  }

  init() {
    /** @todo implement */
  }

  copyFile(from: string, dest: string) {
    return copySync(from, dest);
  }

  copyDir(from: string, dest: string) {
    return copySync(from, dest);
  }

  packages: TemplatePackageInterface;

  async initGit(): Promise<void> {
    if (this.git) {
      await new Promise((resolve) =>
        resolve(
          execFileSync("git", ["init"], {
            encoding: "utf8",
            cwd: this._outputDir,
          }),
        )
      );
    }
  }

  initGitSync(): void {
    if (this.git) {
      execFileSync("git", ["init"], { encoding: "utf8", cwd: this._outputDir });
    }
  }

  tools: {
    tailwind: TailwindTool;
    eslint: ESLintTool;
    sass: SassTool;
    prettier: PrettierTool;
  } = {
    tailwind,
    eslint,
    prettier,
    sass,
  };

  use<U extends BaseToolOptions = BaseToolOptions>(
    tool: BaseTool<U>,
    options?: U,
    //deno-lint-ignore no-explicit-any
  ): (ReturnType<BaseTool<U>["init"]> extends Promise<any> ? true
    : false) extends true ? Promise<void> : void {
    const res = tool.init({
      ...(this as TemplateBuiltContext<typeof this._templ.options>),
      ...{
        options,
        run: this.run,
        runSync: this.runSync,
        addScript: this.addScript,
        error: this.error,
        writeFile: this.writeFile,
        readFile: this.readFile,
        readFileSync: this.readFileSync,
      },
    });
    if (res instanceof Promise) {
      return res.then((_) =>
        this.updateContext({
          ...this,
          ...{
            options,
            run: this.run,
            runSync: this.runSync,
            addScript: this.addScript,
            error: this.error,
          },
        })
        //deno-lint-ignore no-explicit-any
      ) as any;
    }
    //deno-lint-ignore no-explicit-any
    return undefined as any;
  }

  private updateContext<T extends BaseToolOptions = BaseToolOptions>(
    _res: TemplateToolContext<T>,
  ) {
    // nothing
  }

  async run(...args: string[]): Promise<void> {
    await new Promise((resolve) =>
      resolve(
        execFileSync(args[0], args.slice(1), {
          encoding: "utf8",
          cwd: this._outputDir,
        }),
      )
    );
  }
  runSync(...args: string[]): void {
    execFileSync(args[0], args.slice(1), {
      encoding: "utf8",
      cwd: this._outputDir,
    });
  }
  createDir(dir: string): void {
    return Deno.mkdirSync(
      isAbsolute(dir) ? dir : join(this._outputDir, dir),
    );
  }
  createFile(file: string, contents?: string): void {
    Deno.createSync(
      isAbsolute(file) ? file : join(this._outputDir, file),
    )
      .writeSync(new TextEncoder().encode(contents));
  }
  writeFile(file: string, contents: string): void {
    Deno.writeTextFileSync(
      isAbsolute(file) ? file : join(this._outputDir, file),
      contents,
    );
  }
  async readFile(file: string): Promise<string> {
    return await Deno.readTextFile(join(this._outputDir, file));
  }
  readFileSync(file: string): string {
    return Deno.readTextFileSync(
      isAbsolute(file) ? file : join(this._outputDir, file),
    );
  }

  chDir(newDir: string): void {
    this._outputDir = isAbsolute(newDir)
      ? newDir
      : join(this._outputDir, newDir);
  }
  fileExists(file: string): boolean {
    return existsSync(
      isAbsolute(file) ? file : join(this._outputDir, file),
    );
  }
  addScript(name: string, cmd: string) {
    this.packageJsonRecord[name] = cmd;
  }

  transformConfig(_file: string, _addedConfig: object) {
    throw new Error("Unsupported Command!");
  }

  // ======= others ======

  dumpDotEnv(): Array<[string, string]> {
    return Object.entries(this.dotEnvContext).map(([file, map]) => {
      return [
        file,
        Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join("\n"),
      ];
    });
  }
}

// class TemplateToolContextImpl<T> implements
