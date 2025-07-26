import {
  IOInterfaceMixin,
  TemplateContext,
  TemplatePackageInterface,
} from "./base.ts";

/** Template JavaScript Runtimes that can be used with grayprint */
export type TemplateRuntime = "deno" | "node" | "bun";

/** Template Package Managers that can be used with grayprint */
export type TemplatePackageManager = "deno" | "bun" | "npm" | "pnpm" | "yarn";

/**
 * The context provided to the tool used for helping to set up a given tool
 */
export interface TemplateToolContext<
  T extends BaseToolOptions = BaseToolOptions,
> extends Omit<TemplateContext, "config">, IOInterfaceMixin {
  options?: T;
  runtime: TemplateRuntime;
  packageManager: TemplatePackageManager;
  packages: TemplatePackageInterface;
}

export interface BaseToolOptions {
  //deno-lint-ignore no-explicit-any
  [k: string]: any;
}

/**
 * Defines a Tool
 *
 * A tool is a representation of common items/tools, such as ESLint or Tailwind
 * used in developing code.
 */
export interface BaseTool<T extends BaseToolOptions = BaseToolOptions> {
  name: string;
  version: string;
  init: <U extends T = T>(
    context: TemplateToolContext<U>,
  ) => Promise<void> | void;
}
