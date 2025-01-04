import { BaseToolOptions } from "@grayprint/core";
import { defineCoreTool } from "./base.ts";

const frameworkMappings = {
  React: {
    extensions: (typescript: boolean) => typescript ? ['js', 'jsx'] : ['js', 'ts', 'jsx', 'tsx']
  }
}

interface TailwindOptions extends BaseToolOptions {
  
}

export default defineCoreTool({
  name: "tailwind",
});
