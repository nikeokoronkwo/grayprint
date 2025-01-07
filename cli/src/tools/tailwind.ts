import { TailwindOptions } from "@grayprint/core";
import { defineCoreTool } from "./base.ts";
import { FrameworkType, MetaFrameworkType } from "../core/frameworks.ts";
import { bold, green, yellow } from "jsr:@std/fmt/colors";

const TailwindFrameworks = [
  "react",
  "vue",
  "angular",
  "svelte",
  "qwik",
  "solid",
] as const;
type TailwindFramework =
  | Exclude<FrameworkType, "preact">
  | typeof TailwindFrameworks[number]
  | MetaFrameworkType;

const frameworkMappings: Record<TailwindFramework, {
  extensions: (typescript: boolean) => string[];
  cssFile: string;
  htmlFile?: string;
  sourceDir: string[];
  noExplicitPostCss?: boolean;
  otherContentItems?: string[];
}> = {
  react: {
    extensions: (typescript: boolean) =>
      !typescript ? ["js", "jsx"] : ["js", "ts", "jsx", "tsx"],
    cssFile: "./src/index.css",
    htmlFile: "./index.html",
    sourceDir: ["./src"],
  },
  nextjs: {
    extensions: (typescript) =>
      !typescript ? ["js", "jsx", "mdx"] : ["js", "ts", "jsx", "tsx", "mdx"],
    cssFile: "globals.css",
    htmlFile: undefined,
    sourceDir: ["./app", "./pages", "./components"],
  },
  remix: {
    extensions: (typescript: boolean) =>
      !typescript ? ["js", "jsx"] : ["js", "ts", "jsx", "tsx"],
    cssFile: "./app/tailwind.css",
    htmlFile: undefined,
    sourceDir: ["./app"],
  },
  vue: {
    extensions: (typescript) =>
      !typescript ? ["vue", "js", "jsx"] : ["vue", "js", "ts", "jsx", "tsx"],
    cssFile: "./src/style.css",
    htmlFile: "./index.html",
    sourceDir: ["./src"],
  },
  nuxt: {
    extensions: (typescript) =>
      typescript ? ["js", "ts", "vue"] : ["js", "vue"],
    cssFile: "./assets/css/main.css",
    htmlFile: undefined,
    sourceDir: ["./components"],
    otherContentItems: [
      "./layouts/**/*.vue",
      "./pages/**/*.vue",
      "./plugins/**/*.{js,ts}",
      "./app.vue",
      "./error.vue",
    ],
    noExplicitPostCss: true,
  },
  svelte: {
    extensions: (typescript) =>
      !typescript
        ? ["svelte", "js", "jsx"]
        : ["svelte", "js", "ts", "jsx", "tsx"],
    cssFile: "./src/app.css",
    htmlFile: "./index.html",
    sourceDir: ["./src"],
  },
  sveltekit: {
    extensions: (typescript) =>
      typescript ? ["svelte", "js", "ts", "html"] : ["svelte", "js", "html"],
    cssFile: "./src/app.css",
    htmlFile: undefined,
    sourceDir: ["./src"],
  },
  qwik: {
    extensions: (typescript: boolean) =>
      !typescript ? ["js", "jsx"] : ["js", "ts", "jsx", "tsx"],
    cssFile: "",
    sourceDir: [],
  },
  qwikcity: {
    extensions: (typescript: boolean) =>
      !typescript ? ["js", "jsx"] : ["js", "ts", "jsx", "tsx"],
    cssFile: "./src/global.css",
    htmlFile: undefined,
    sourceDir: ["./src"],
  },
  solid: {
    extensions: (typescript: boolean) =>
      !typescript ? ["js", "jsx"] : ["js", "ts", "jsx", "tsx"],
    cssFile: "./src/index.css",
    sourceDir: [],
  },
  solidstart: {
    extensions: (_) => ["js", "ts", "jsx", "tsx"],
    cssFile: "./src/index.css",
    htmlFile: undefined,
    sourceDir: ["./src"],
  },

  fresh: {
    extensions: (_) => ["ts", "tsx"],
    cssFile: "./static/styles.css",
    htmlFile: undefined,
    sourceDir: ["routes", "islands", "components"],
  },

  angular: {
    extensions: (_) => ["html", "ts"],
    cssFile: "./src/styles.css",
    sourceDir: ["./src"],
  },
};

function isAFrameworkKeyMapping(key: string): key is TailwindFramework {
  return Object.keys(frameworkMappings).includes(key);
}

export default defineCoreTool<TailwindOptions>({
  name: "tailwind",
  init(context) {
    let mapping: typeof frameworkMappings[keyof typeof frameworkMappings];
    let noFramework = false;
    const framework = context.options?.framework;

    if (framework && isAFrameworkKeyMapping(framework)) {
      mapping = frameworkMappings[framework];
    } else {
      noFramework = true;
      mapping = {
        extensions: (t) => t ? ["html", "js", "ts"] : ["html", "js"],
        cssFile: context.options?.noFramework?.cssFile ?? "./main.css",
        sourceDir: [context.options?.noFramework?.srcDir ?? "./src"],
      };
    }
    context.installSync("tailwindcss", { dev: true });
    context.installSync("postcss", { dev: true });
    context.installSync("autoprefixer", { dev: true });

    switch (context.packageManager) {
      case "deno":
        context.runSync("deno", "run", "-A", "npm:tailwindcss", "init", "-p");
        break;
      case "bun":
        context.runSync("bunx", "tailwindcss", "init", "-p");
        break;
      case "npm":
        context.runSync("npx", "tailwindcss", "init", "-p");
        break;
      case "pnpm":
        context.runSync("pnpm", "exec", "tailwindcss", "init", "-p");
        break;
      case "yarn":
        context.runSync("yarn", "exec", "tailwindcss", "init", "-p");
        break;
    }

    context.writeFile(
      "tailwind.config.js",
      composeTailwindFile(mapping, context.options?.typescript ?? true),
    );

    context.writeFile(
      mapping.cssFile,
      `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
    );

    if (noFramework) {
      context.writeFile(
        "postcss.config.js",
        `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}`,
      );
    }

    if (
      context.options?.framework === "Nuxt" ||
      context.options?.framework === "nuxt"
    ) {
      // update nuxt.config.ts
      context.log(
        yellow(
          `${bold("WARN")}: Unable to update "nuxt.config.${
            context.options?.typescript ? "ts" : "js"
          }".\n`,
        ) +
          `To enable TailwindCSS to work correctly with Nuxt, update your ${
            bold("defineNuxtConfig")
          } with the following property:\n\n` +
          green(`postcss: {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
},
css: ["~/assets/css/main.css"]`),
      );
    }

    if (
      context.options?.framework === "SvelteKit" ||
      context.options?.framework === "sveltekit"
    ) {
      // update svelte.config.js
      context.log(
        yellow(
          `${bold("WARN")}: Unable to update "svelte.config.js".\n`,
        ) +
          `To enable TailwindCSS to work correctly with SvelteKit, add the following import\n\n` +
          green(
            `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';`,
          ) +
          `\n\nand update your ${
            bold("config")
          } with the following property:\n\n` +
          green(`preprocess: vitePreprocess()`),
      );
    }

    if (
      context.options?.framework === "Remix" ||
      context.options?.framework === "remix"
    ) {
      // update remix file
      context.log(
        yellow(
          `${bold("WARN")}: Unable to update "./app/root.${
            context.options?.typescript ? "tsx" : "jsx"
          }".\n`,
        ) +
          `To enable TailwindCSS to work completely with Remix, add the following import\n\n` +
          green(`import stylesheet from "~/tailwind.css?url";`),
      );
    }
  },
});

function composeTailwindFile(
  options: typeof frameworkMappings[keyof typeof frameworkMappings],
  typescript: boolean,
): string {
  // ./src => ./src/**/*.{...exts}
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [${
    options.sourceDir.map((s) =>
      `"${s}/**/*.{${options.extensions(typescript).join(",")}}"`
    ).concat(options.otherContentItems ?? []).concat(
      options.htmlFile ? [`"${options.htmlFile}"`] : [],
    ).join(",")
  }],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
}
