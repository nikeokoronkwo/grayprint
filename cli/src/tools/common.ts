import { BaseTool } from "@boilerplate/core";

export interface CoreTool extends BaseTool {
}

export function defineCoreTool(tool: CoreTool): CoreTool {
  return tool;
}
