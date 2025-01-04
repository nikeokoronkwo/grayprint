import { blue, red } from "jsr:@std/fmt/colors";
import { isAbsolute, join, relative } from "jsr:@std/path";

import {
  BaseTool,
  TemplateBuiltContext,
  TemplateCommands,
  TemplateContext,
  TemplateEnv,
  TemplateOptions,
  TemplatePackageManager,
  TemplatePaths,
  TemplateRuntime,
} from "@boilerplate/core";

import { TemplateConfig } from "../utils/config.ts";
import { TemplateType } from "../plugin.ts";
import * as pm from "../core/packageManagers.ts";
import tailwind from "../tools/tailwind.ts";
import eslint from "../tools/eslint.ts";
import sass from "../tools/sass.ts";
import prettier from "../tools/prettier.ts";

/** @todo Implement use tool */
function runTool<T = Record<string, any>>(tool: BaseTool<T>) {

}

/**
 * The main application class
 */
export class Application<T extends TemplateConfig = TemplateConfig>
  implements TemplateBuiltContext {
  private templateType: TemplateType;
  private verbose: boolean;

  constructor(options: {
    name: string
    typescript: boolean;
    config: T;
    templateType?: TemplateType;
    runtime?: TemplateRuntime;
    cwd?: string;
    verbose?: boolean;
    git?: boolean;
  }) {
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
    this.packageManager = pm.NPM.name;
    this.commands = pm.NPM.commands;

    this.env = new TemplateEnv();
    this.tools = {
      tailwind,
      eslint,
      sass,
      prettier,
    };
  }

  static fromContext(
    context: TemplateContext,
    options?: {
      templateType?: TemplateType;
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
      cwd: context.cwd,
      templateType: options?.templateType,
    });
  }

  addEnv(env: TemplateEnv) {
    this.env = env;
  }

  addPackageManager(pm: TemplatePackageManager) {
    if (pm === "bun") {
      this.runtime = "bun";
    } else if (pm === "deno") {
      this.runtime = "deno";
    } else {
      this.runtime = "node";
    }
  }

  name: string;
  env: TemplateEnv;
  typescript: boolean;
  runtime: TemplateRuntime;
  packageManager: TemplatePackageManager;
  path: TemplatePaths;
  tools: {
    tailwind: BaseTool;
    eslint: BaseTool;
    sass: BaseTool;
    prettier: BaseTool;
  };
  config: T;
  commands: TemplateCommands;
  cwd: string;
  git: boolean;


  async initGit() {
    return await this.run("git", "init");
  }
  initGitSync(): void {
    return this.runSync("git", "init");
  }

  /** @todo use tool */
  use<T = Record<string, any>>(tool: BaseTool<T>, options?: T) {
    const res = runTool(tool);
    this.updateContext(res);
  }

  private updateContext(res) {

  }

  async install(tool: string) {
    return await this.run(...this.commands.install, tool);
  }
  installSync(tool: string) {
    return this.runSync(...this.commands.install, tool);
  }

  /** TODO: Verbose */
  async run(...args: string[]) {
    console.assert(args.length > 0, "Runner arguments must be at least one");

    console.info(blue(args.join(',')))

    const command = new Deno.Command(args[0], /* !this.verbose ? */ {
      args: args.length === 1 ? [] : args.slice(1),
      cwd: this.cwd,
    } /* : { args: args.length === 1 ? [] : args.slice(1), cwd: this.cwd, stdin: 'piped', stdout: 'piped', stderr: 'piped' } */);
    const { success, stderr, stdout } = await command.output();

    console.log(new TextDecoder().decode(stdout))

    if (!success) this.error(new TextDecoder().decode(stderr));
  }

  runSync(...args: string[]) {
    console.assert(args.length > 0, "Runner arguments must be at least one");

    console.info(blue(args.join(',')))

    const command = new Deno.Command(args[0], /* !this.verbose ? */ {
      args: args.length === 1 ? [] : args.slice(1),
      cwd: this.cwd,
    } /* : { args: args.length === 1 ? [] : args.slice(1), cwd: this.cwd, stdin: 'piped', stdout: 'piped', stderr: 'piped' } */);
    const { success, stderr, stdout } = command.outputSync();

    console.log(new TextDecoder().decode(stdout))

    if (!success) this.error(new TextDecoder().decode(stderr));
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
  copyFile(from: string, dest: string) {}
  copyDir(from: string, dest: string) {}

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
    Deno.mkdirSync(join(this.cwd, dir), { recursive });
  }

  createFile(file: string, contents?: string) {
    const f = Deno.createSync(file);
    if (contents) f.writeSync(new TextEncoder().encode(contents));
  }

  writeFile(file: string, contents: string) {
    Deno.writeTextFileSync(file, contents);
  }
}
