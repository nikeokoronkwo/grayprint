export const frameworks: {
  [k: string]: {
    name: string;
    meta: {
      name: string;
      scaffold: (options: any) => string[];
    }[];
    apps?: {
      name: string;
      scaffold: (options: any) => string[];
    }[];
  };
} = {
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
        ];
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
        ];
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
    meta: [{
      name: "Fresh",
      runtime: "deno",
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
        ];
      },
    }],
  },
  angular: {
    name: "Angular",
    meta: [],
  },
  vue: {
    name: "Vue",
    meta: [{
      name: "Nuxt",
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
        ];
      },
    }],
  },
  solid: {
    name: "Solid",
    meta: [{
      name: "SolidStart",
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
        ];
      },
    }],
  },
  qwik: {
    name: "Qwik",
    meta: [{
      name: "QwikCity",
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
        ];
      },
    }],
  },
  vanilla: {},
} as const;

export type FrameworkType = keyof typeof frameworks;
