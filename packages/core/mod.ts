//deno-lint-ignore-file no-unused-vars no-explicit-any -- vars used in JSDoc, and any type needed for record
import {
  commonQuestions,
  IOInterfaceMixin,
  TemplateContext,
  TemplateOptions,
  TemplatePackageInterface,
} from "./base.ts";
import { ESLintTool, PrettierTool, SassTool, TailwindTool } from "./builtin.ts";
import {
  BaseTool,
  BaseToolOptions,
  TemplatePackageManager,
  TemplateRuntime,
} from "./tools.ts";

type isInitAsync<T extends (...args: any) => any> = ReturnType<T> extends
  Promise<any> ? true : false;
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

export interface DotEnvOptions {
  type?: string;
}

/**
 * A built template context, used during {@link BaseTemplate.create} for building the template
 */
export interface TemplateBuiltContext<T extends TemplateOptions[] = []>
  extends TemplateContext<T>, IOInterfaceMixin {
  env: TemplateEnv;
  /**
   * Whether typescript is enabled for this project
   *
   * This option can be set by either specifying in the `cfg` option in the `defineTemplate` function, or by prompting and specifying the option name to be `"typescript"`
   * For prompting, you can make use of {@link commonQuestions.typescript}
   */
  typescript: boolean;

  /**
   * Apply variables in a user's dotenv file(s), adding variables if any
   *
   * @param key
   * @param value
   * @param options
   */
  dotEnv(key: string, options?: DotEnvOptions): string | undefined;
  dotEnv(key: string, value?: string, options?: DotEnvOptions): string;

  /**
   * Whether git is enabled for this project
   *
   * This option can be set by either specifying in the `cfg` option in the `defineTemplate` function, or by prompting and specifying the option name to be `"git"`
   * For prompting, you can make use of {@link commonQuestions.git}
   */
  git: boolean;

  /** Creates a package.json or deno.json in the current project directory, using available information if any */
  init(): void;

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
  // commands: TemplateCommands;
  packages: TemplatePackageInterface;

  /**
   * Added context usually gotten from `beforeCreate`
   */
  ctx: Record<string, any>;

  /**
   * Builtin tools from Grayprint
   *
   * Builtin tools can be accessed via this object, as these tools are implemented in the CLI
   * @todo Document each property
   */
  tools: {
    /**
     * Tailwind Tool
     *
     * For more information, check out [Tailwind](https://tailwindcss.com)
     */
    tailwind: TailwindTool;

    /**
     * ESLint Tool
     *
     * For more information, check out [ESLint](https://eslint.org)
     */
    eslint: ESLintTool;
    sass: SassTool;

    /**
     * Prettier Tool
     *
     * For more information, check out [Prettier](https://prettier.io)
     */
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

  /** Get the current dir of the template, if any
   *
   * Useful when you'd want to copy/paste items from the template to the user's dir
   */
  get templateDir(): string;
}

export interface TemplatePaths {
  ROOT: string;
}

export interface TemplateEnv {
  get(name: string): string | undefined;
  set(name: string, value: string): void;
}

export interface BaseTemplate {
  /** The name of the template */
  name: string;

  /** The runtimes that can be used with this template */
  runtimes?: TemplateRuntime[];

  /** The options that can be used with this template */
  options: TemplateOptions[];

  cfg?: {
    typescript?: boolean;
    packageManager?: TemplatePackageManager;
    git?: boolean;
  };

  /**
   * Create a new package.json upon initializing project?
   * @default false
   */
  initPkg?: boolean;

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

  /** Whether to automatically install dependencies after creating this template.
   *
   * If this option is not passed, a prompt will query the user to do so
   */
  autoInstallDeps?: boolean;
}

export * from "./base.ts";
export * from "./tools.ts";
export * from "./builtin.ts";
