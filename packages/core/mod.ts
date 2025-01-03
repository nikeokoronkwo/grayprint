import { loadSync } from "jsr:@std/dotenv";

export type TemplateRuntime = "deno" | "node" | "bun";
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
export type TemplateOptions = StringTemplateOptions |
  BooleanTemplateOptions |
  ListTemplateOptions;

export const commonQuestions: {
  platform: TemplateOptions;
  typescript: TemplateOptions;
  packageManager: TemplateOptions;
} = {
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
    name: "package_manager",
    question: "What package manager do you want to use?",
    type: "list",
    dependsOn: "platform",
    options: (v) => {
      const items = ["npm", "pnpm", "yarn"];
      if (v === "bun") items.push("bun");
      else if (v === "deno") items.push("deno");
      return items;
    },
  },
};
type DefaultValue<T extends TemplateOptions> = T["type"] extends "string" ? string : T["type"] extends "boolean" ? boolean : T["type"] extends "list" ? string[] : string;
type TemplateConfig<T extends TemplateOptions[]> = {
  [K in T[number]as K["name"]]: DefaultValue<K> | undefined;
};
export interface TemplateContext<T extends TemplateOptions[]> {
  config: TemplateConfig<T>;
  /** Run a cli question for the given  */
  question: (q: TemplateOptions) => DefaultValue<typeof q>;
  // deno-lint-ignore no-explicit-any
  log: (msg: any) => void;
}
export interface TemplateBuiltContext<T extends TemplateOptions[]>
  extends TemplateContext<T> {
  env: TemplateEnv;
  typescript: boolean;
  runtime: TemplateRuntime;
  packageManager: TemplatePackageManager;
  use: (tool: Tool) => void;
  install: (tool: string) => void;
  run: (...args: string[]) => void;
  path: TemplatePaths;
  copyFile: (from: string, dest: string) => void;
  copyDir: (from: string, dest: string) => void;
}

interface TemplatePaths {
  ROOT: string;
}
/**
 * Defines a Tool
 */
export interface BaseTool { 

}
/** @todo Implement */
class TemplateEnv {
  private env: Map<string, string>;

  constructor() {
    this.env = new Map(Object.entries(loadSync({ export: true })));
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
  name: string;
  runtimes: TemplateRuntime[];
  options: TemplateOptions[];
  beforeCreate?: (app: TemplateContext<this["options"]>) => Record<string, any>;
  tools?: Tool[];
  create: (app: TemplateBuiltContext<this["options"]>) => void;
  tools: {
    tailwind: BaseTool,
    eslint: BaseTool,
    sass: BaseTool,
    prettier: BaseTool
  }
}
