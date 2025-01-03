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
import { TemplateConfig } from "./utils/config.ts";
import { TemplateType } from "./plugin.ts";
import * as pm from "./core/packageManagers.ts";
import tailwind from "./tools/tailwind.ts";
import eslint from "./tools/eslint.ts";
import sass from "./tools/sass.ts";
import prettier from "./tools/prettier.ts";

/**
 * The main application class
 */
export class Application<T extends TemplateConfig = TemplateConfig>
  implements TemplateBuiltContext {
  private templateType: TemplateType;
  private verbose: boolean;

  constructor(options: {
    typescript: boolean;
    config: T;
    templateType?: TemplateType;
    runtime?: TemplateRuntime;
    cwd?: string;
    verbose?: boolean;
  }) {
    this.typescript = options.typescript;
    this.config = options.config;

    (this.templateType = options.templateType ?? TemplateType.Path),
      (this.path = {
        ROOT: options.cwd ?? Deno.cwd(),
      });
    this.cwd = options.cwd ?? Deno.cwd();
    this.verbose = options.verbose ?? false;

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
      typescript: Object.keys(context.config).includes("typescript")
        ? context.config["typescript"]
        : false,
      config: context.config,
      cwd: context.cwd,
      runtime: context.config["runtime"],
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
  cwd?: string | undefined;

  use(tool: BaseTool) {}
  install(tool: string) {}
  run(...args: string[]) {
    console.assert(args.length > 0, "Runner arguments must be at least one");
    // const command = new Deno.Command(args[0], { args: args.length === 1 ? [] : args.slice(1), cwd: this.cwd } verbose ? { args, cwd: options.cwd } : { args, stdin: 'piped', stdout: 'piped', stderr: 'piped', cwd: options.cwd });
  }

  copyFile(from: string, dest: string) {}
  copyDir(from: string, dest: string) {}

  question(q: TemplateOptions): PromiseLike<string | boolean | string[]> {
    throw new Error(
      "Cannot use question query on built context. Run on `beforeCreate` to fix this error.",
    );
  }

  log(msg: any) {}

  error(msg: any) {}

  createDir(dir: string) {}
  createFile(file: string, contents?: string) {}
  writeFile(file: string, contents?: string) {}
}
