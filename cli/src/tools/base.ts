import { BaseTool } from "@grayprint/core";

type BaseToolConfig = Record<string, any>;
export interface CoreTool<T = BaseToolConfig> extends BaseTool<T> {
}

export function defineCoreTool<T = BaseToolConfig>(tool: CoreTool<T>): CoreTool<T> {
  return tool;
}
