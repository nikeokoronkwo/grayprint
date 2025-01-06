import { blue, red } from "jsr:@std/fmt/colors";
import { isAbsolute, join, relative } from "jsr:@std/path";
import { exists } from "jsr:@std/fs/exists";

import {
  BaseTool,
  BaseToolOptions,
  TemplateBuiltContext,
  TemplateCommands,
  TemplateContext,
  TemplateEnv,
  TemplateOptions,
  TemplatePackageManager,
  TemplatePaths,
  TemplateRuntime,
  TemplateToolContext,
} from "@grayprint/core";

import { TemplateBuiltConfig } from "../utils/config.ts";
import { TemplateType } from "../plugin.ts";
import * as pm from "../core/packageManagers.ts";
import tailwind from "../tools/tailwind.ts";
import eslint from "../tools/eslint.ts";
import sass from "../tools/sass.ts";
import prettier from "../tools/prettier.ts";
import {
  ESLintTool,
  PrettierTool,
  SassTool,
  TailwindTool,
} from "../../../packages/core/builtin.ts";

type isPromise<T> = T extends Promise<any> ? true : false;

function updateConfigFile(file: string, addedConfig: object) {
  throw new Error("Unimplemented");
}

export interface ApplicationOptions<
  T extends TemplateBuiltConfig = TemplateBuiltConfig,
> {
  name: string;
  typescript: boolean;
  config: T;
  templateType?: TemplateType;
  runtime?: TemplateRuntime;
  cwd?: string;
  verbose?: boolean;
  git?: boolean;
  cfg?: Record<string, any>;
}

/**
 * The main application class
 */
export class Application<T extends TemplateBuiltConfig = TemplateBuiltConfig>
  implements TemplateBuiltContext {
  private templateType: TemplateType;
  private verbose: boolean;
  private environment;

  constructor(options: ApplicationOptions<T>) {
    this.name = options.name;
    this.typescript = options.typescript;
    this.config = options.config;

    (this.templateType = options.templateType ?? TemplateType.Path),
      (this.path = {
        ROOT: options.cwd ?? Deno.cwd(),
      });
    this.cwd = options.cwd ?? Deno.cwd();
    this.verbose = options.verbose ?? false;
    this.git = options.git ?? true;

    /** @todo Default should be a function to infer runtime from available in path */
    this.runtime = options.runtime ?? (pm.NPM.runtime.name as TemplateRuntime);
    const newLocal = Object.entries(pm).find(([_, pm]) =>
      pm.name === options.runtime
    )?.[1];
    this.packageManager = newLocal?.name ?? pm.NPM.name;
    this.commands = newLocal?.commands ?? pm.NPM.commands;
    this.environment = newLocal ?? pm.NPM;

    this.env = new TemplateEnv();
    this.tools = {
      tailwind,
      eslint,
      sass,
      prettier,
    };

    this.configFile = options.cfg ?? {};
  }

  static fromContext(
    context: TemplateContext,
    options?: {
      templateType?: TemplateType;
      cwd?: string;
    },
  ): Application {
    return new Application({
      name: context.name,
      typescript: Object.keys(context.config).includes("typescript")
        //@ts-ignore Object contains indexes
        ? context.config["typescript"]
        : false,
      //@ts-ignore Object contains indexes
      runtime: context.config["runtime"],
      //@ts-ignore Object contains indexes
      git: context.config["git"],
      config: context.config,
      cwd: options?.cwd ?? context.cwd,
      templateType: options?.templateType,
      cfg: context.configFile,
    });
  }

  addEnv(env: TemplateEnv) {
    this.env = env;
  }

  addPackageManager(manager: TemplatePackageManager) {
    if (manager === "bun") {
      this.runtime = "bun";
    } else if (manager === "deno") {
      this.runtime = "deno";
    } else {
      this.runtime = "node";
    }
    const newLocal = Object.entries(pm).find(([_, p]) => p.name === manager)
      ?.[1];
    this.packageManager = newLocal!.name;
    this.commands = newLocal!.commands;
  }

  async dumpConfig() {
    if (!(await exists(join(this.cwd, this.configFileName)))) {
      Deno.create(join(this.cwd, this.configFileName));
    }
    const contents = await Deno.readTextFile(
      join(this.cwd, this.configFileName),
    );
    let jsonContents = JSON.parse(contents);
    for (const k in jsonContents) {
      switch (typeof jsonContents[k]) {
        case "object":
          jsonContents[k] = { ...jsonContents[k], ...this.configFile[k] };
          break;
        default:
          jsonContents[k] = this.configFile[k] ?? jsonContents[k];
          break;
      }
    }
    await Deno.writeTextFile(
      join(this.cwd, this.configFileName),
      JSON.stringify(jsonContents),
    );
  }

  async installDependencies() {
    return await this.run(...this.commands.installDeps);
  }

  private updateContext<T extends BaseToolOptions = BaseToolOptions>(
    res: TemplateToolContext<T>,
  ) {
    // throw new Error("Unimplemented");
  }

  private getInstallArgs(tool: string, options?: {
    dev?: boolean;
    exact?: boolean;
  }) {
    const args = [...this.commands.install, tool];
    if (options?.dev) args.push(`--${this.commands.mappings.dev}`);
    if (options?.exact) args.push(`--${this.commands.mappings.exact}`);
    return args;
  }

  name: string;
  env: TemplateEnv;
  typescript: boolean;
  runtime: TemplateRuntime;
  packageManager: TemplatePackageManager;
  path: TemplatePaths;
  tools: {
    tailwind: TailwindTool;
    eslint: ESLintTool;
    sass: SassTool;
    prettier: PrettierTool;
  };
  config: T;
  commands: TemplateCommands & { installDeps: string[] };
  cwd: string;
  git: boolean;
  configFile: Record<string, any> = {};

  public get configFileName(): string {
    return this.environment.runtime.configFile;
  }

  async initGit() {
    return await this.run("git", "init");
  }
  initGitSync(): void {
    return this.runSync("git", "init");
  }

  use<U extends BaseToolOptions = BaseToolOptions>(
    tool: BaseTool<U>,
    options?: U,
  ): (ReturnType<BaseTool<U>["init"]> extends Promise<any> ? true
    : false) extends true ? Promise<void> : void {
    const res = tool.init({
      ...(this as TemplateBuiltContext),
      ...{
        options,
        run: this.run,
        runSync: this.runSync,
        install: this.install,
        installSync: this.installSync,
        getInstallArgs: this.getInstallArgs,
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
            install: this.install,
            installSync: this.installSync,
            getInstallArgs: this.getInstallArgs,
            addScript: this.addScript,
            error: this.error,
          },
        })
      ) as any;
    }
    return undefined as any;
  }

  async install(tool: string, options?: {
    dev?: boolean;
    exact?: boolean;
  }) {
    return await this.run(...this.getInstallArgs(tool, options));
  }
  installSync(tool: string, options?: {
    dev?: boolean;
    exact?: boolean;
  }) {
    return this.runSync(...this.getInstallArgs(tool, options));
  }

  /** TODO: Verbose */
  async run(...args: string[]) {
    console.assert(args.length > 0, "Runner arguments must be at least one");

    const command = new Deno.Command(args[0], /* !this.verbose ? */ {
      args: args.length === 1 ? [] : args.slice(1),
      cwd: this.cwd,
    } /* : { args: args.length === 1 ? [] : args.slice(1), cwd: this.cwd, stdin: 'piped', stdout: 'piped', stderr: 'piped' } */);
    const { success, stderr, stdout } = await command.output();

    if (!success) this.error(new TextDecoder().decode(stderr));
  }

  runSync(...args: string[]) {
    console.assert(args.length > 0, "Runner arguments must be at least one");

    const command = new Deno.Command(args[0], /* !this.verbose ? */ {
      args: args.length === 1 ? [] : args.slice(1),
      cwd: this.cwd,
    } /* : { args: args.length === 1 ? [] : args.slice(1), cwd: this.cwd, stdin: 'piped', stdout: 'piped', stderr: 'piped' } */);
    const { success, stderr, stdout } = command.outputSync();

    if (!success) {
      this.error(new TextDecoder().decode(stderr));
      throw new Error(`Error when running ${args.join(", ")}`);
    }
  }

  transformConfig(file: string, addedConfig: object) {
    return updateConfigFile(file, addedConfig);
  }

  addScript(name: string, cmd: string) {
    if (this.runtime === "deno") {
      this.configFile["tasks"] = {
        ...this.configFile["tasks"],
        ...{ [name]: cmd },
      };
    } else {
      this.configFile["scripts"] = {
        ...this.configFile["scripts"],
        ...{ [name]: cmd },
      };
    }
  }

  /** For these:
   *
   * ## NPM
   * - Fetch contents
   * - Convert contents into virtual file system
   * - Run code with VFS
   * - Delete and cleanup afterwards
   *
   * ## JSR
   * Either:
   * - Fetch metadata for given package
   * - Organize files in checksum as VFS
   * - Run code with VFS
   * - For each file needed, retrieve from VFS by pulling via request
   * - Delete and Cleanup afterwards
   *
   * Or:
   * - Fetch contents via NPM compat API
   * - Convert contents into virtual file system
   * - Run code with VFS
   * - Delete and cleanup afterwards
   *
   * ## Github
   * - Use {@link https://github.com/octokit/octokit.js/} for API communication or do direct API
   * - Retrieve list of contents in directory
   * - Read and run contents in directory
   * - Convert to VFS
   * - Run code with VFS
   * - Delete and cleanup afterwards
   */
  copyFile(from: string, dest: string) {
    throw new Error("Not implemented for this class");
  }
  copyDir(from: string, dest: string) {
    throw new Error("Not implemented for this class");
  }

  question(q: TemplateOptions): PromiseLike<string | boolean | string[]> {
    throw new Error(
      "Cannot use question query on built context. Run on `beforeCreate` to fix this error.",
    );
  }

  log = console.log;

  error(msg: any) {
    console.error(red(msg));
    Deno.exit(1);
  }

  createDir(dir: string, recursive?: boolean) {
    Deno.mkdirSync(isAbsolute(dir) ? dir : join(this.cwd, dir), { recursive });
  }

  createFile(file: string, contents?: string) {
    const f = Deno.createSync(isAbsolute(file) ? file : join(this.cwd, file));
    if (contents) f.writeSync(new TextEncoder().encode(contents));
  }

  writeFile(file: string, contents: string) {
    return Deno.writeTextFileSync(
      isAbsolute(file) ? file : join(this.cwd, file),
      contents,
    );
  }
  async readFile(file: string): Promise<string> {
    return await Deno.readTextFile(
      isAbsolute(file) ? file : join(this.cwd, file),
    );
  }
  readFileSync(file: string): string {
    return Deno.readTextFileSync(
      isAbsolute(file) ? file : join(this.cwd, file),
    );
  }

  chDir(newDir: string): void {
    this.cwd = isAbsolute(newDir) ? newDir : join(this.cwd, newDir);
  }
}
