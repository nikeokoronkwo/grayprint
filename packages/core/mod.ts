/** Template JavaScript Runtimes that can be used with grayprint */
export type TemplateRuntime = "deno" | "node" | "bun";

/** Template Package Managers that can be used with grayprint */
export type TemplatePackageManager = "deno" | "bun" | "npm" | "pnpm" | "yarn";

/** 
 * The different option types that can be used for a template option
 * 
 * "string" represents textual input
 * "boolean" represent boolean input as either yes/no
 * "list" represent input with a set of options
 * 
 * @see {@link TemplateOptions} for more information
 */
type TemplateOptionType = "string" | "boolean" | "list";

/**
 * Base implementation of template options
 */
interface BaseTemplateOptions<T extends TemplateOptionType> {
  /**
   * The name of the given template option
   * 
   * Used to access the value returned by the user in the {@link TemplateContext.config} object
   */
  name: string;

  /**
   * The question to ask the user, which will prompt the user for the given information
   */
  question: string;
  /**
   * The type of template option.
   * This is usually assigned in inherited implementations of this interface
   */
  type?: T;

  dependsOn?: string;
  dependsIf?: (v: string | boolean | string[]) => boolean;

  /** 
   * Whether the option is a secure option, like a password 
   * @todo Make use of this option
   */
  secure?: boolean;
}

export interface StringTemplateOptions extends BaseTemplateOptions<"string"> {
  /** A function that can be used to check whether a given value is correct or not */
  validate?: (value: string) => string | boolean;

  /** A default value for the given option */
  default?: string;
}
export interface BooleanTemplateOptions extends BaseTemplateOptions<"boolean"> {
  /** A default value for the given option */
  default?: boolean;
}
export interface ListTemplateOptions<T extends string = string>
  extends BaseTemplateOptions<"list"> {
  /**
   * The options that the user is to choose from when prompted by the template
   * @todo Implement functionality for handling a function type for this alongside {@link BaseTemplateOptions.dependsOn}
   */
  options: T[];

  /**
   * Whether the given option can contain multiple answers or only one
   * @default false - only one option can be selected
   */
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
  /** This template option prompts the user for the name of the project */
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
  /** This template option prompts the user for the runtime they are using */
  platform: {
    name: "platform",
    question: "What platform are you designing for?",
    type: "list",
    options: ["deno", "node", "bun"],
  },
  /** This template option prompts the user for whether they want to use typescript */
  typescript: {
    name: "typescript",
    question: "Do you want to use typescript?",
    type: "boolean",
    default: true,
  },
  /** This template option prompts the user for which package manager they want to use */
  packageManager: {
    name: "packageManager",
    question: "What package manager do you want to use?",
    type: "list",
    dependsOn: "platform",
    options: ['npm', 'pnpm', 'yarn', 'bun', 'deno'],
  },
  /** This template option prompts the user for whether they want to use git */
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

/** 
 * An object containing the values passed from `options` after prompting them to the user.
 * 
 * This object gathers the names as keys, and the values as "values" into this object.
 * 
 * This object can be accessed via the `config` parameter in the `beforeCreate` and `create` functions
 * 
 * For instance: the following list of prompts (from {@link commonQuestions})
 * ```ts
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
  }
 * ```
 * 
 * Becomes the following `TemplateConfig` object
 * ```ts
 * {
 *   name: string;
 *   platform: "deno" | "node" | "bun";
 *   typescript: boolean;
 * }
 * ```
 *
 * 
 * Result types can either be of type `string`, `boolean` or `string[]` (i.e `Array<string>`)
 */
export type TemplateConfig<T extends TemplateOptions[]> = {
  [K in T[number] as K["name"]]: DefaultValue<K> | undefined;
};

/**
 * # Template Context
 * A template context object is an object containing not only options about the user's environment, utilities and options (gotten from the command line via `options`),
 * but also utility functions that can be used for various configurations to the user's environment such as printing out messages, getting information about the user's package manager, installing libraries, copying folders and files from the template's definition page to the user's system, asking questions after the main config, and more.
 * 
 * Template Contexts are implemented by the CLI upon initialisation and provide the necessary functionality needed for each option.
 * 
 * ## Before Context Templates
 * The base definition of a Template Context is used in the `beforeCreate` function for running or performing any tasks before the real initialisation takes place, like asking any questions based on options already passed from `options`. 
 * 
 */
export interface TemplateContext<T extends TemplateOptions[] = []> {
  /** The name of the template */
  name: string;
  
  /** 
   * The configuration options from the user prompts 
   * 
   * @see TemplateConfig - For more information
   */
  config: TemplateConfig<T>;

  /** Run a cli question for the given option
   * @param {TemplateOptions} q The question, as a {@link TemplateOptions} object
   * @returns {PromiseLike<string | boolean | string[]>} The direct value from the question
   */
  question: (q: TemplateOptions) => PromiseLike<string | boolean | string[]>;

  /**
   * Custom logger for logging messages out
   * @param msg The message to log out
   * @returns {void}
   */
  // deno-lint-ignore no-explicit-any
  log: (msg: any) => void;

  /**
   * Used for printing out error messages
   * 
   * This does not exit when run in `beforeCreate` at the moment
   * @param msg The message to log out
   * @returns {void}
   */
  error: (msg: any) => void;

  /**
   * The current working directory **on the user's system**
   */
  cwd?: string;

  /**
   * A JSON representation of the configuration file for a given project.
   * 
   * Although most scaffolding would create a config file for a given project, this would create one if not available, and can be used for assigning or adding properties to the configuration file
   * 
   * The changes are reflected at the end of the `create` function
   */
  configFile: Record<string, any>;
}

/**
 * An object used to encapsulate important arguments for commands for a given package manager
 * 
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

/**
 * A mixin that contains shared functionality for built contexts used in tools and template
 * 
 * It mainly contains functions for installing tools and running commands on the user's project root
 */
interface BuiltContext {
  install: (tool: string, options?: {
    dev?: boolean,
    exact?: boolean
  }) => Promise<void>;
  installSync: (tool: string, options?: {
    dev?: boolean,
    exact?: boolean
  }) => void;
  run: (...args: string[]) => Promise<void>;
  runSync: (...args: string[]) => void;
  createDir: (dir: string) => void;
  createFile: (file: string, contents?: string) => void;
  writeFile: (file: string, contents: string) => void;
  addScript: (name: string, cmd: string) => void;
}

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
  use: <T extends BaseTool = BaseTool>(tool: T, options?: ToolOptions<T>) => void;
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
    tailwind: BaseTool;
    eslint: BaseTool;
    sass: BaseTool;
    prettier: BaseTool;
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

export interface BaseToolOptions {
  [k: string]: any;
}

export interface TemplateToolContext<T extends BaseToolOptions = BaseToolOptions> extends Omit<TemplateContext, 'config'>, BuiltContext {
  options: T,
  runtime: TemplateRuntime
}
/**
 * Defines a Tool
 */
export interface BaseTool<T extends BaseToolOptions = BaseToolOptions> {
  name: string;
  init?: <U extends T = T>(context: TemplateToolContext<U>) => void;
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
  autoInstallDeps?: boolean
}
