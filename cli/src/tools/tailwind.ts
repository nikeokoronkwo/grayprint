import { BaseToolOptions, TailwindOptions } from "@grayprint/core";
import { defineCoreTool } from "./base.ts";

const TailwindFrameworks = [
  "react",
  "vue",
  "angular",
  "svelte",
  "qwik",
  "solid",
] as const;
type TailwindFramework = typeof TailwindFrameworks[number];

const frameworkMappings: Record<TailwindFramework, {
  extensions: (typescript: boolean) => string[];
}> = {
  react: {
    extensions: (typescript: boolean) =>
      typescript ? ["js", "jsx"] : ["js", "ts", "jsx", "tsx"],
  },
  vue: {
    extensions: function (typescript: boolean): string[] {
      throw new Error("Function not implemented.");
    },
  },
  angular: {
    extensions: function (typescript: boolean): string[] {
      throw new Error("Function not implemented.");
    },
  },
  svelte: {
    extensions: function (typescript: boolean): string[] {
      throw new Error("Function not implemented.");
    },
  },
  qwik: {
    extensions: function (typescript: boolean): string[] {
      throw new Error("Function not implemented.");
    },
  },
  solid: {
    extensions: function (typescript: boolean): string[] {
      throw new Error("Function not implemented.");
    },
  },
};

export default defineCoreTool<TailwindOptions>({
  name: "tailwind",
});
