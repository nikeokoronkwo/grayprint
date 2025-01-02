export interface Template {
  // extends BaseTemplate
}

export interface Tool {
  // extends BaseTool
}

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
export function defineTool(tool: Tool): Tool {
  return tool;
}
