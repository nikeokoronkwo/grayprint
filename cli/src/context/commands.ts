import {
  TemplatePackageInterface,
  TemplatePackageOptions,
} from "@grayprint/core";
import { PackageManager } from "./package_manager.ts";
import { spawnSync } from "node:child_process";

export function getCommandsForPackageManager(
  packageManager: PackageManager,
  cwd: string
): TemplatePackageInterface {
  switch (packageManager) {
    case "deno":
      return denoCommands(cwd);
    case "bun":
      return bunCommands(cwd);
    case "npm":
      return npmCommands(cwd);
    case "pnpm":
      return pnpmCommands(cwd);
    case "yarn":
      return yarnCommands(cwd);
  }
}

class TemplatePkgManagerInterface implements TemplatePackageInterface {
  name: PackageManager;
  execName?: string;

  installArgs: string[];
  addArgs: string[];
  removeArgs: string[];
  execArgs: string[];
  runArgs: string[];
  createArgs: string[];

  devArg: string;
  exactArg: string;

  cwd: string;

  constructor(options: {
    name: PackageManager;
    execName?: string;
    add?: string[];
    install: string[];
    create: string[];
    remove: string[];
    exec?: string[];
    run: string[];
    mappings: {
      dev: string;
      exact: string;
    };
    cwd?: string;
  }) {
    this.name = options.name;
    this.addArgs = options.add ?? options.install;
    this.removeArgs = options.remove;
    this.execArgs = options.exec ?? [];
    this.devArg = options.mappings.dev;
    this.exactArg = options.mappings.exact;
    this.installArgs = options.install;
    this.runArgs = options.run;
    this.execName = options.execName;
    this.createArgs = options.create;
    this.cwd = options.cwd ?? Deno.cwd();
  }

  async add(
    pkgs: string[],
    options?: TemplatePackageOptions,
  ): Promise<boolean> {
    const args = [...this.addArgs];

    if (options?.dev) args.push(this.devArg);
    if (options?.exact && (this.name !== "deno" && this.name !== "pnpm")) {
      args.push(this.exactArg);
    }
    if (this.name === "deno") args.push("--npm"); // assume deps are npm deps

    args.push(...pkgs);

    return await this._runCommand(args);
  }

  async remove(pkgs: string[]): Promise<boolean> {
    return await this._runCommand([...this.removeArgs, ...pkgs]);
  }

  async install(): Promise<boolean> {
    return await this._runCommand([...this.installArgs]);
  }

  async run(command: string, ...args: string[]): Promise<boolean> {
    return await this._runCommand([...this.runArgs, command, ...args]);
  }

  async exec(pkg: string, ...args: string[]): Promise<boolean> {
    return await this._runCommand([...this.execArgs, pkg, ...args], true);
  }

  async cmd(args: string[], options?: { exec?: boolean }): Promise<boolean> {
    return await this._runCommand(args, options?.exec);
  }

  async create(pkg: string, ...args: string[]): Promise<boolean> {
    const allArgs = [...this.createArgs, "--"];
    if (this.name === "deno" && !pkg.startsWith("npm:")) {
      allArgs.push(`npm:create-${pkg}`);
    } else allArgs.push(pkg);

    allArgs.push(...args);

    return await this._runCommand(allArgs);
  }

  private _runCommand(args: string[], exec: boolean = false) {
    return new Promise<boolean>((resolve) => {
      const { status: code } = spawnSync(exec ? this.execName ?? this.name : this.name, args, { encoding: 'utf8', cwd: this.cwd });

      return resolve(code === 0);
    })
  }
}

const denoCommands = (cwd: string) => new TemplatePkgManagerInterface({
  name: "deno",
  add: ["add"],
  remove: ["remove"],
  install: ["install"],
  create: ["run", "-A"],
  run: ["run"],
  exec: ["run", "-A"],
  mappings: {
    dev: "-D",
    exact: "--exact", // no exact
  },
  cwd
});

const npmCommands = (cwd: string) => new TemplatePkgManagerInterface({
  name: "npm",
  execName: "npx",
  remove: ["remove"],
  install: ["install"],
  create: ["init"],
  run: ["run"],
  mappings: {
    dev: "--save-dev",
    exact: "--save-exact", // no exact
  },
  cwd
});

const pnpmCommands = (cwd: string) => new TemplatePkgManagerInterface({
  name: "pnpm",
  execName: "pnpx",
  add: ["add"],
  remove: ["remove"],
  install: ["install"],
  create: ["create"],
  run: [],
  exec: [],
  mappings: {
    dev: "-D",
    exact: "--exact", // no exact
  },
  cwd
});

const yarnCommands = (cwd: string) => new TemplatePkgManagerInterface({
  name: "yarn",
  add: ["add"],
  remove: ["remove"],
  install: ["install"],
  create: ["create"],
  run: [],
  exec: [],
  mappings: {
    dev: "--dev",
    exact: "--exact", // no exact
  },
  cwd
});

const bunCommands = (cwd: string) => new TemplatePkgManagerInterface({
  name: "bun",
  execName: "bunx",
  add: ["add"],
  remove: ["remove"],
  install: ["install"],
  create: ["create"],
  run: ["run"],
  exec: [],
  mappings: {
    dev: "-d",
    exact: "-E", // no exact
  },
  cwd
});
