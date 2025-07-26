import { BaseTool, BaseToolOptions } from "@grayprint/core";

export interface CoreTool<T extends BaseToolOptions = BaseToolOptions>
  extends BaseTool<T> {
}

export function defineCoreTool<T extends BaseToolOptions = BaseToolOptions>(
  tool: CoreTool<T>,
): CoreTool<T> {
  return tool;
}
