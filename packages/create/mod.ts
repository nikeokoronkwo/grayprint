//deno-lint-ignore-file no-explicit-any
import type { BaseTemplate, BaseTool } from "@grayprint/core";
export { commonQuestions } from "@grayprint/core";

export interface Template extends BaseTemplate {}

export interface Tool<T = {}> extends BaseTool<T> {}

/**
 * A function used for defining a grayprint template
 * @param template {Template} The template definition
 * @returns The template
 */
export function defineTemplate(template: Template): Template {
  return template;
}

/**
 * A function used for defining a grayprint tool
 * @param tool
 * @returns
 */
export function defineTool<T = {}>(tool: Tool<T>): Tool<T> {
  return tool;
}
