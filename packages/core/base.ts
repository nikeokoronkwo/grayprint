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
    options: ["node", "deno", "bun"],
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
    options: ["npm", "pnpm", "yarn", "bun", "deno"],
  },
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
 * A mixin that contains shared functionality for built contexts used in tools and template
 *
 * It mainly contains functions for installing tools and running commands on the user's project root
 */

export interface BuiltContext {
  install: (tool: string, options?: {
    dev?: boolean;
    exact?: boolean;
  }) => Promise<void>;
  installSync: (tool: string, options?: {
    dev?: boolean;
    exact?: boolean;
  }) => void;
  run: (...args: string[]) => Promise<void>;
  runSync: (...args: string[]) => void;
  createDir: (dir: string) => void;
  createFile: (file: string, contents?: string) => void;
  writeFile: (file: string, contents: string) => void;
  readFile: (file: string) => Promise<string>;
  readFileSync: (file: string) => string;
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
