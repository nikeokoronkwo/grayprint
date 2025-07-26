// deno-lint-ignore-file no-explicit-any
import { TemplatePackageManager, TemplateRuntime } from "./tools.ts";

type DefaultValue<T extends TemplateOptions> = T extends
  StringTemplateOptions<any, any> ? string
  : T extends BooleanTemplateOptions<any, any> ? boolean
  : T extends ListTemplateOptions<any, any> ? string[]
  : never;

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
export type TemplateConfig<
  T extends readonly TemplateOptions[] = TemplateOptions[],
> = {
  [K in T[number] as K["name"]]: DefaultValue<K> | undefined;
};

type ExtractTemplateConfigValue<Name extends string> = Name extends
  keyof TemplateConfig<infer U> ? TemplateConfig<U>[Name]
  : never;

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
interface BaseTemplateOptions<
  T extends TemplateOptionType,
  Name extends string,
  DependsOn extends string | undefined = undefined,
> {
  /**
   * The name of the given template option
   *
   * Used to access the value returned by the user in the {@link TemplateContext.config} object
   */
  name: Name;

  /**
   * The question to ask the user, which will prompt the user for the given information
   */
  question: string;
  /**
   * The type of template option.
   * This is usually assigned in inherited implementations of this interface
   */
  type?: T;

  dependsOn?: DependsOn;
  dependsIf?: (
    v: DependsOn extends string ? ExtractTemplateConfigValue<DependsOn>
      : never,
  ) => boolean;

  /**
   * Whether the option is a secure option, like a password
   * @todo Make use of this option
   */
  secure?: boolean;
}

export interface StringTemplateOptions<
  Name extends string,
  Depends extends string | undefined = undefined,
> extends BaseTemplateOptions<"string", Name, Depends> {
  /** A function that can be used to check whether a given value is correct or not */
  validate?: (value: string) => string | boolean;

  /** A default value for the given option */
  default?: string;
}
export interface BooleanTemplateOptions<
  Name extends string,
  Depends extends string | undefined = undefined,
> extends BaseTemplateOptions<"boolean", Name, Depends> {
  /** A default value for the given option */
  default?: boolean;
}

export interface Option {
  title: string;
  description?: string;
}

export interface ListTemplateOptions<
  Name extends string,
  Depends extends string | undefined = undefined,
  T extends string | Option = string,
> extends BaseTemplateOptions<"list", Name, Depends> {
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
 * ## Template Options
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
  | StringTemplateOptions<string, any>
  | BooleanTemplateOptions<string, any>
  | ListTemplateOptions<string, any, string>
  | ListTemplateOptions<string, any, Option>;

/** Common questions that users can use as {@link TemplateOptions} in projects */
export const commonQuestions: {
  name: TemplateOptions;
  // platform: TemplateOptions;
  typescript: TemplateOptions;
  // packageManager: TemplateOptions;
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
  // /** This template option prompts the user for the runtime they are using */
  // platform: {
  //   name: "platform",
  //   question: "What platform are you designing for?",
  //   type: "list",
  //   options: ["node", "deno", "bun"],
  // },
  /** This template option prompts the user for whether they want to use typescript */
  typescript: {
    name: "typescript",
    question: "Do you want to use typescript?",
    type: "boolean",
    default: true,
  },
  // /** This template option prompts the user for which package manager they want to use */
  // packageManager: {
  //   name: "packageManager",
  //   question: "What package manager do you want to use?",
  //   type: "list",
  //   dependsOn: "platform",
  //   options: ["npm", "pnpm", "yarn", "bun", "deno"],
  // },
  /** This template option prompts the user for whether they want to use git */
  git: {
    name: "git",
    question: "Do you want to use Git for your project?",
    type: "boolean",
    default: true,
  },
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

  runtime: TemplateRuntime;

  /**
   * In the future, we may have a `packageManager` interface for directly adding packages
   */
  packageManager: TemplatePackageManager;

  /** Run a cli question for the given option
   * @param {TemplateOptions} q The question, as a {@link TemplateOptions} object
   * @returns {Promise<string | boolean | string[]>} The direct value from the question
   */
  question: (q: TemplateOptions) => Promise<string | boolean | string[]>;

  /**
   * Custom logger for logging messages out
   * @param msg The message to log out
   * @returns {void}
   */
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
 * A mixin that contains shared functionality for built contexts used in tools and template
 *
 * It mainly contains functions for installing tools and running commands on the user's project root
 */

export interface IOInterfaceMixin {
  run: (...args: string[]) => Promise<void>;
  runSync: (...args: string[]) => void;
  createDir: (dir: string) => void;
  createFile: (file: string, contents?: string) => void;
  writeFile: (file: string, contents: string) => void;
  readFile: (file: string) => Promise<string>;
  readFileSync: (file: string) => string;
  fileExists: (file: string) => boolean;
  addScript: (name: string, cmd: string) => void;

  /** Changes the working directory for future commands */
  chDir(newDir: string): void;

  /**
   * This function is used for manipulaing configuration files by programmatically manipualing the AST of the configuration files.
   *
   * This makes adding options to configuration files much easier rather than having to deal with making use of regular expressions.
   *
   * ```ts
   * // add runtimeConfig property to Nuxt Config
   * context.transformConfig('nuxt.config.js', {
   *   runtimeConfig: {
   *     apiKey: '*****'
   *   }
   * });
   * ```
   *
   * **NOTE**: This API is **unstable** and might be removed in the future, depending on usage.
   *
   * @param {string} file The name of the file to apply the given configuration updates to
   * @param {object} addedConfig The configuration object to add, or override, as a JS literal object
   * @returns {void}
   */
  transformConfig: (file: string, addedConfig: object) => void;
}

export interface TemplatePackageOptions {
  dev?: boolean;
  exact?: boolean;
}

/**
 * An object used to encapsulate important calls for commands for a given package manager
 */
export interface TemplatePackageInterface {
  name: TemplatePackageManager;
  add(pkgs: string[], options?: TemplatePackageOptions): Promise<boolean>;
  remove(pkgs: string[]): Promise<boolean>;
  install(): Promise<boolean>;
  run(command: string, ...args: string[]): Promise<boolean>;
  /**
   * @param pkg The package to execute. Note to add the `npm:` specifier if using Deno for NPM
   * @param args The arguments to pass when executing the package
   */
  exec(pkg: string, ...args: string[]): Promise<boolean>;
  create(pkg: string, ...args: string[]): Promise<boolean>;
  cmd(args: string[], options?: { exec?: boolean }): Promise<boolean>;
}
