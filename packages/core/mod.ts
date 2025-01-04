/** Template JavaScript Runtimes that can be used with grayprint */
export type TemplateRuntime = "deno" | "node" | "bun";

/** Template Package Managers that can be used with grayprint */
export type TemplatePackageManager = "deno" | "bun" | "npm" | "pnpm" | "yarn";

type TemplateOptionType = "string" | "boolean" | "list";

interface BaseTemplateOptions<T extends TemplateOptionType> {
  name: string;
  question: string;
  type?: T;
  dependsOn?: string;
  dependsIf?: (v: string | boolean | string[]) => boolean;
  /** Whether the option is a secure option, like a password */
  secure?: boolean;
}

export interface StringTemplateOptions extends BaseTemplateOptions<"string"> {
  /** A function that can be used to check whether a given value is correct or not */
  validate?: (value: string) => string | boolean;
  default?: string;
}
export interface BooleanTemplateOptions extends BaseTemplateOptions<"boolean"> {
  default?: boolean;
}
export interface ListTemplateOptions<T extends string = string>
  extends BaseTemplateOptions<"list"> {
  options: T[] | ((v: T) => T[]);
  multiple?: boolean;
}

/**
 * # Template Options
 * Template options are objects used to denote queries/questions that are run by grayprint to receive user input from the command line.
 *
 * This can be used for configuring your templates with user-defined information.
 *
 * Template Options can represent either String Values, Boolean Values, Select Options or MultiSelect Options (both of the latter representing list values, the last when `multiple` set to true)
 *
 * ```ts
 * {
 *   name: 'name', // the name of the given option
 *   question: 'What is the name of your project', // the question to ask
 * }
 * ```
 *
 * By default, all options are assumed to be {@link StringTemplateOptions} (unless an `options` field is specified, which makes it a {@link ListTemplateOptions})
 */
export type TemplateOptions =
  | StringTemplateOptions
  | BooleanTemplateOptions
  | ListTemplateOptions;

/** Common questions that users can use as {@link TemplateOptions} in projects */
export const commonQuestions: {
  name: TemplateOptions;
  platform: TemplateOptions;
  typescript: TemplateOptions;
  packageManager: TemplateOptions;
  git: TemplateOptions;
} = {
  name: {
          name: "name",
          question: "What is the name of your project?",
          validate: (v) => {
            if (v.length <= 1 || v === "") {
              return "You must specify a valid name for your project (at least two characters)";
            } else if (v.includes(" ")) {
              return 'You cannot have a name with spaces, use "_" to separate';
            } else return true;
          },
        },
  platform: {
    name: "platform",
    question: "What platform are you designing for?",
    type: "list",
    options: ["deno", "node", "bun"],
  },
  typescript: {
    name: "typescript",
    question: "Do you want to use typescript?",
    type: "boolean",
    default: true,
  },
  packageManager: {
    name: "packageManager",
    question: "What package manager do you want to use?",
    type: "list",
    dependsOn: "platform",
    options: ['npm', 'pnpm', 'yarn', 'bun', 'deno'],
  },
  git: {
    name: "git",
    question: "Do you want to use Git for your project?",
    type: "boolean",
    default: true,
  }
};
export type DefaultValue<T extends TemplateOptions> = T["type"] extends "string"
  ? string
  : T["type"] extends "boolean" ? boolean
  : T["type"] extends "list" ? string[]
  : (string | boolean | string[]);
export type TemplateConfig<T extends TemplateOptions[]> = {
  [K in T[number] as K["name"]]: DefaultValue<K> | undefined;
};
export interface TemplateContext<T extends TemplateOptions[] = []> {
  name: string;
  
  config: TemplateConfig<T>;
  /** Run a cli question for the given  */
  question: (q: TemplateOptions) => PromiseLike<string | boolean | string[]>;
  // deno-lint-ignore no-explicit-any
  log: (msg: any) => void;

  error: (msg: any) => void;

  cwd?: string;
}
export interface TemplateCommands {
  install: string[];
  create: string[];
  run: string[];
  exec: string[];
  start: string[];
  remove: string[];
  mappings: {
    dev: string;
    exact: string;
  };
}

export type ToolOptions<T extends BaseTool> = {};

export interface TemplateBuiltContext<T extends TemplateOptions[] = []>
  extends TemplateContext<T> {
  env: TemplateEnv;
  typescript: boolean;
  git: boolean;
  runtime: TemplateRuntime;
  packageManager: TemplatePackageManager;
  use: <T extends BaseTool = BaseTool>(tool: T, options?: ToolOptions<T>) => void;
  install: (tool: string) => Promise<void>;
  installSync: (tool: string) => void;
  run: (...args: string[]) => Promise<void>;
  runSync: (...args: string[]) => void;
  path: TemplatePaths;
  copyFile: (from: string, dest: string) => void;
  copyDir: (from: string, dest: string) => void;
  createDir: (dir: string) => void;
  createFile: (file: string, contents?: string) => void;
  writeFile: (file: string, contents: string) => void;
  commands: TemplateCommands;
  tools: {
    tailwind: BaseTool;
    eslint: BaseTool;
    sass: BaseTool;
    prettier: BaseTool;
  };
  initGit(): Promise<void>;
  initGitSync(): void;
}

export interface TemplatePaths {
  ROOT: string;
}

export interface TemplateToolContext<T> {
  options: T
}
/**
 * Defines a Tool
 */
export interface BaseTool<T = Record<string, any>> {
  name: string;
  init: (context: TemplateToolContext<T>) => void;
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

  /** The beforeCreate command for this template */
  beforeCreate?: (
    app: TemplateContext<this["options"]>,
  ) => Promise<Record<string, any>> | Record<string, any>;

  /** The tools that can be used with this template */
  tools?: BaseTool[];

  /** The create command for this template */
  create: (app: TemplateBuiltContext<this["options"]>) => Promise<void> | void;
}
