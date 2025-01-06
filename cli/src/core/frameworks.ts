
export const frameworks = {
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
    meta: [{
      name: "Fresh",
      runtime: 'deno',
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
      }
    }]
  },
  angular: {
    name: 'Angular',
    meta: []
  },
  vue: {
    name: 'Vue',
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
        ].join(" ");
      }
    }]
  },
  solid: {
    name: 'Solid',
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
        ].join(" ");
      }
    }]
  },
  qwik: {
    name: 'Qwik',
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
        ].join(" ");
      }
    }]
  },
  vanilla: {},
} as const;

export type FrameworkType = keyof typeof frameworks;
