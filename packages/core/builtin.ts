import { BaseTool, BaseToolOptions } from "./tools.ts";

export interface PrettierOptions extends BaseToolOptions {
  /** Whether prettier is available */
  eslint: boolean;
}

export interface ESLintOptions extends BaseToolOptions {
  react?: boolean;
  vue?: boolean;
  typescript?: boolean;
  server?: boolean;
  browser?: boolean;
}

export interface TailwindOptions extends BaseToolOptions {
}

export type TailwindTool = BaseTool<TailwindOptions>;
export type ESLintTool = BaseTool<ESLintOptions>;
export type PrettierTool = BaseTool<PrettierOptions>;
export type SassTool = BaseTool;
