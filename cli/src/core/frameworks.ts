class Framework {
  name: string;
  frontend?: FrontendFramework;
  meta?: MetaFramework[];
  backend?: string[];
  mobile?: string[];

  constructor(
    name: string,
    options: {
      meta?: MetaFramework[];
      frontend?: FrontendFramework;
      backend?: string[];
      mobile?: string[];
    } = {},
  ) {
    this.name = name;
    this.meta = options.meta;
    this.backend = options.backend;
    this.mobile = options.mobile;
  }
}
class FrontendFramework {
  name: string;
  vite?: boolean;
  pkgName?: string;
  scaffold?: () => void;

  constructor(name: string, options?: {
    vite?: boolean;
    pkgName?: string;
    scaffold?: () => void;
  }) {
    this.name = name;
    this.vite = options?.vite;
    this.pkgName = options?.pkgName;
    this.scaffold = options?.scaffold;
  }
}
class MetaFramework {
  name: string;
  pkgName?: string;
  pkgScaffold?: (name: string) => void;

  constructor(name: string, scaffold?: string | ((name: string) => void)) {
    this.name = name;
    if (typeof scaffold === "string") this.pkgName = scaffold;
    else this.pkgScaffold = scaffold;
  }
}
const frameworks = {
  react: {
    name: "React",
    meta: [{
      name: "NextJS",
      // When scaffolding nextjs app, run deno install afterwards
      scaffold: (options) => {
        return [
          ...options.packageInstaller,
          "create-next",
          options["tailwind"] ? "--tailwind" : "--no-tailwind",
          options["eslint"] ? "--eslint" : "--no-eslint",
          options["typescript"] ? "--typescript" : "--javascript",
          options.packageManager === "deno"
            ? "--skip-install"
            : `--use-${options.packageManager}`,
        ].join(" ");
      },
    }, {
      name: "Remix",
      scaffold: (options) => {
        return [
          ...options.commands.create,
          "remix",
          "-y",
          options.config["name"],
          "--no-git-init",
          "--package-manager",
          options.packageManager,
        ].join(" ");
      },
    }],
    apps: [{
      name: "React Native",
      scaffoldOnOwn: true,
      scaffold: (options) => {
        // todo
      },
    }, {
      name: "Ionic",
      scaffoldOnOwn: true,
      scaffold: (options) => {
      },
    }],
  },
  preact: {
    name: "Preact",
  },
  angular: {},
  vue: {},
  solid: {},
  qwik: {},
  vanilla: {},
};
