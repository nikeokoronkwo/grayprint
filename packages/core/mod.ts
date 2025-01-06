//deno-lint-ignore no-unused-vars -- vars used in JSDoc
import {
  BuiltContext,
  commonQuestions,
  TemplateContext,
  TemplateOptions,
} from "./base.ts";
import { ESLintTool, PrettierTool, SassTool, TailwindTool } from "./builtin.ts";
import {
  BaseTool,
  BaseToolOptions,
  TemplatePackageManager,
  TemplateRuntime,
} from "./tools.ts";

/**
 * An object used to encapsulate important arguments for commands for a given package manager
 */
export interface TemplateCommands {
  install: string[];
  create: string[];
  /** Commands for running scripts or packages like `pnpm/yarn dlx` */
  run: string[];
  /** Commands for running scripts or packages like `pnpm/yarn exec` */
  exec: string[];
  start: string[];
  remove: string[];
  mappings: {
    dev: string;
    exact: string;
  };
}

type isInitAsync<T extends (...args: any) => any> = ReturnType<T> extends
  Promise<any> ? true : false;
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

// TODO: Document
export interface TemplateBuiltContext<T extends TemplateOptions[] = []>
  extends TemplateContext<T>, BuiltContext {
  env: TemplateEnv;
  /**
   * Whether typescript is enabled for this project
   *
   * This option can be set by either specifying in the `cfg` option in the `defineTemplate` function, or by prompting and specifying the option name to be `"typescript"`
   * For prompting, you can make use of {@link commonQuestions.typescript}
   */
  typescript: boolean;

  /**
   * Whether git is enabled for this project
   *
   * This option can be set by either specifying in the `cfg` option in the `defineTemplate` function, or by prompting and specifying the option name to be `"git"`
   * For prompting, you can make use of {@link commonQuestions.git}
   */
  git: boolean;

  /**
   * The runtime that the project is running on.
   *
   * This is usually assigned based on either the presence of a prompt by  specifying the option name to be `"runtime"`, via the `runtime` option in `defineTemplate`
   * @todo Complete documentation
   */
  runtime: TemplateRuntime;
  packageManager: TemplatePackageManager;
  use: <U extends BaseToolOptions = BaseToolOptions>(
    tool: BaseTool<U>,
    options?: U,
  ) => isInitAsync<(typeof tool)["init"]> extends true ? Promise<void> : void;
  path: TemplatePaths;
  copyFile: (from: string, dest: string) => void;
  copyDir: (from: string, dest: string) => void;
  commands: TemplateCommands;

  /**
   * Builtin tools from Grayprint
   *
   * Builtin tools can be accessed via this object, as these tools are implemented in the CLI
   * @todo Document each property
   */
  tools: {
    tailwind: TailwindTool;
    eslint: ESLintTool;
    sass: SassTool;
    prettier: PrettierTool;
  };

  /**
   * A simple function to initialise Git in the user's root project directory.
   *
   * This function can only work if {@link TemplateBuiltContext.git} is set to true
   */
  initGit(): Promise<void>;

  /** A synchronised version of the `initGit` function */
  initGitSync(): void;
}

export interface TemplatePaths {
  ROOT: string;
}

/** @todo Implement */
export class TemplateEnv {
  private env: Map<string, string>;

  constructor() {
    this.env = new Map();
  }

  get(name: string) {
    return this.env.get(name) ?? Deno.env.get(name);
  }
  set(name: string, value: string) {
    return this.env.set(name, value);
  }

  dump(envFile?: string): string {
    return Array.from(this.env.entries())
      .map((key, value) => `${key}="${value}"`)
      .join("\n");
  }
}

export interface BaseTemplate {
  /** The name of the template */
  name: string;

  /** The runtimes that can be used with this template */
  runtimes: TemplateRuntime[];

  /** The options that can be used with this template */
  options: TemplateOptions[];

  cfg?: {
    typescript?: boolean;
    packageManager?: TemplatePackageManager;
    git?: boolean;
  };

  /**
   * The beforeCreate command for this template
   * ```ts
   * import {defineTemplate} from "@grayprint/create";
   *
   * defineTemplate({
   *     // ...
   *     beforeCreate: (context) => {
   *         let swc;
   *
   *         // if the option for 'react' was passed as true, prompt the user for swc
   *         if (context.config['react']) {
   *             swc = context.question({
   *                 name: 'swc',
   *                 question: 'Do you want to use swc?',
   *                 type: 'boolean',
   *                 default: true,
   *             });
   *         }
   *
   *         // return any extra config you might want to pass to the main `create` function
   *         return { swc };
   *     }
   * })
   * ```
   */
  beforeCreate?: (
    app: TemplateContext<this["options"]>,
  ) => Promise<Record<string, any>> | Record<string, any>;

  /** The tools that can be used with this template */
  tools?: BaseTool[];

  /** The create command for this template */
  create: (app: TemplateBuiltContext<this["options"]>) => Promise<void> | void;

  /** Whether to automatically install dependencies after creating this template */
  autoInstallDeps?: boolean;
}

export * from "./base.ts";
export * from "./tools.ts";
export * from "./builtin.ts";
