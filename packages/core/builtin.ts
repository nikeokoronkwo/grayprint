import { BaseTool, BaseToolOptions } from "./tools.ts";

export interface PrettierOptions extends BaseToolOptions {
  /** Whether eslint is available */
  eslint: boolean;
  /** Whether tailwind is available */
  tailwind: boolean;
}

export interface ESLintOptions extends BaseToolOptions {
  react?: boolean;
  vue?: boolean;
  typescript?: boolean;
  server?: boolean;
  browser?: boolean;
  config?: string;
}

export interface TailwindOptions extends BaseToolOptions {
  vite?: boolean;
  typescript?: boolean;
  postcss?: boolean;
  cssFile?: string;
}

export type TailwindTool = BaseTool<TailwindOptions>;
export type ESLintTool = BaseTool<ESLintOptions>;
export type PrettierTool = BaseTool<PrettierOptions>;
export type SassTool = BaseTool;
