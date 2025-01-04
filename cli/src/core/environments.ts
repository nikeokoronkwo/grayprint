import { TemplateRuntime } from "@grayprint/core";

export interface Runtime {
  name: TemplateRuntime;
}

export const NODE: Runtime = {
  name: "node",
};

export const BUN: Runtime = {
  name: "node",
};

export const DENO: Runtime = {
  name: "node",
};
