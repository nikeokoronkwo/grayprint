import { TemplateCommands, TemplatePackageManager } from "@grayprint/core";
import * as env from "./environments.ts";
import type { Runtime } from "./environments.ts";

interface PM {
  name: TemplatePackageManager;
  commands: TemplateCommands & { installDeps: string[] };
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
    installDeps: ["npm", "install"],
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
    installDeps: ["pnpm", "install"],
    mappings: {
      dev: "save-dev",
      exact: "save-exact",
    },
  },
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
    remove: ["yarn", "remove"],
    installDeps: ["npm", "install"],
    mappings: {
      dev: "dev",
      exact: "exact",
    },
  },
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
    installDeps: ["deno", "install"],
    mappings: {
      dev: "dev",
      exact: "", // no exact
    },
  },
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
    remove: ["bun", "remove"],
    installDeps: ["bun", "install"],
    mappings: {
      dev: "dev",
      exact: "exact",
    },
  },
};
