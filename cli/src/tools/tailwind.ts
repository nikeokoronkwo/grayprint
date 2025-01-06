import { BaseToolOptions } from "@grayprint/core";
import { defineCoreTool } from "./base.ts";

const TailwindFrameworks = ['react', 'vue', 'angular', 'svelte', 'qwik', 'solid'] as const;
type TailwindFramework = typeof TailwindFrameworks[number];

const frameworkMappings: Record<TailwindFramework, {
  extensions: (typescript: boolean) => string[];
}> = {
  react: {
    extensions: (typescript: boolean) => typescript ? ['js', 'jsx'] : ['js', 'ts', 'jsx', 'tsx']
  }
}

interface TailwindOptions extends BaseToolOptions {
  
}

export default defineCoreTool({
  name: "tailwind",
});
