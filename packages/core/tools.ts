import { BuiltContext, TemplateContext } from "./base.ts";

/** Template JavaScript Runtimes that can be used with grayprint */
export type TemplateRuntime = "deno" | "node" | "bun";

/** Template Package Managers that can be used with grayprint */
export type TemplatePackageManager = "deno" | "bun" | "npm" | "pnpm" | "yarn";

export interface TemplateToolContext<
  T extends BaseToolOptions = BaseToolOptions,
> extends Omit<TemplateContext, "config">, BuiltContext {
  options?: T;
  runtime: TemplateRuntime;
  packageManager: TemplatePackageManager;
}

export interface BaseToolOptions {
  [k: string]: any;
}

/**
 * Defines a Tool
 */
export interface BaseTool<T extends BaseToolOptions = BaseToolOptions> {
  name: string;
  init: <U extends T = T>(context: TemplateToolContext<U>) => Promise<void> | void;
}
