//deno-lint-ignore-file no-explicit-any
import type { BaseTemplate, BaseTool } from "@boilerplate/core";
export { commonQuestions } from "@boilerplate/core";

export interface Template extends BaseTemplate {}

export interface Tool<T = Record<string, any>> extends BaseTool<T> {}

/**
 * A function used for defining a boilerplate template
 * @param template {Template} The template definition
 * @returns The template
 */
export function defineTemplate(template: Template): Template {
  return template;
}

/**
 * A function used for defining a boilerplate tool
 * @param tool
 * @returns
 */
export function defineTool<T = Record<string, any>>(tool: Tool<T>): Tool<T> {
  return tool;
}
