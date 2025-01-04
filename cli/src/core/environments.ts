import { TemplateRuntime } from "@grayprint/core";

export interface Runtime {
  name: TemplateRuntime;
  configFile: string;
  lockFile: string;
}

export const NODE: Runtime = {
  name: "node",
  configFile: 'package.json',
  lockFile: 'package-lock.json'
};

export const BUN: Runtime = {
  name: "bun",
  configFile: 'package.json',
  lockFile: 'bun.lockb'
};

export const DENO: Runtime = {
  name: "deno",
  configFile: 'deno.json',
  lockFile: 'deno.lock'
};
