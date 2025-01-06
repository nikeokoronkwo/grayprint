import { TemplateRuntime } from "@grayprint/core";

interface NewType {
  [x: string]: any;
  packageInstaller: any;
  packageManager: string;
}

export const frameworks = {
  react: {
    name: "React",
    meta: [{
      name: "NextJS",
      // When scaffolding nextjs app, run deno install afterwards
      scaffold: (options: NewType) => {
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
      scaffold: (options: NewType) => {
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
      scaffold: (options: NewType) => {
        throw new Error("Unimplemented");
      },
    }, {
      name: "Ionic",
      scaffoldOnOwn: true,
      scaffold: (options: NewType) => {
        throw new Error("Unimplemented");
      },
    }],
  },
  preact: {
    name: "Preact",
    meta: [{
      name: "Fresh",
      runtime: "deno",
      // When scaffolding nextjs app, run deno install afterwards
      scaffold: (options: NewType) => {
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
      scaffold: (options: NewType) => {
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
      scaffold: (options: NewType) => {
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
  svelte: {
    name: "Svelte",
    meta: [{
      name: "SvelteKit",
      scaffold: (options: NewType) => {
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
      scaffold: (options: NewType) => {
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
} as const;

export type FrameworkType = keyof typeof frameworks;
export type MetaFrameworkType = Lowercase<
  typeof frameworks[keyof typeof frameworks]["meta"][number]["name"]
>;
