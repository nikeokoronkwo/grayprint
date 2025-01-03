import { TemplateCommands, TemplatePackageManager } from "@boilerplate/core";
import * as env from "./environments.ts";
import type { Runtime } from "./environments.ts";

interface PM {
  name: TemplatePackageManager;
  commands: TemplateCommands;
  runtime: Runtime;
}

export const NPM: PM = {
  name: "npm",
  runtime: env.NODE,
  commands: {
    install: ["npm", "install"],
    remove: ["npm", "uninstall"],
    create: ["npm", "create"],
    run: ["npx"],
    exec: ["npx"],
    start: ["npm", "run"],
    mappings: {
      dev: "save-dev",
      exact: "save-exact",
    },
  },
};

export const PNPM: PM = {
  name: "pnpm",
  runtime: env.NODE,
  commands: {
    install: ["pnpm", "add"],
    remove: ["pnpm", "remove"],
    create: ["pnpm", "create"],
    run: ["pnpm", "dlx"],
    exec: ["pnpm", "exec"],
    start: ["pnpm"],
    mappings: {
      dev: "save-dev",
      exact: "save-exact",
    },
  } as TemplateCommands,
};
export const YARN: PM = {
  name: "yarn",
  runtime: env.NODE,
  commands: {
    install: ["yarn", "add"],
    create: ["yarn", "create"],
    run: ["yarn", "dlx"],
    exec: ["yarn"],
    start: ["yarn"],
    mappings: {
      dev: "dev",
      exact: "exact",
    },
  } as TemplateCommands,
};
export const DENO: PM = {
  name: "deno",
  runtime: env.DENO,
  commands: {
    install: ["deno", "add"],
    create: ["deno", "run", "-A"],
    run: ["deno", "run", "-A"],
    exec: ["deno", "run", "-A"],
    start: ["deno", "task"],
    remove: ["deno", "remove"],
    mappings: {
      dev: "dev",
      exact: "", // no exact
    },
  } as TemplateCommands,
};
export const BUN: PM = {
  name: "bun",
  runtime: env.BUN,
  commands: {
    install: ["bun", "add"],
    create: ["bun", "create"],
    run: ["bun", "x"],
    exec: ["bun"],
    start: ["bun", "run"],
    mappings: {
      dev: "dev",
      exact: "exact",
    },
  } as TemplateCommands,
};
