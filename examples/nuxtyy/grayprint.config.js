const moduleMap = {
  "@nuxt/content": "content", // @nuxt/content,
  "@nuxt/eslint": "eslint", // @nuxt/eslint,
  "@nuxt/fonts": "fonts", // @nuxt/fonts
  "@nuxt/icon": "icon",
  "@nuxt/image": "image",
  "@nuxt/scripts": "scripts",
  "@nuxt/test-utils": "test-utils",
  "@nuxt/ui": "ui",
  "@pinia/nuxt": "pinia",
  "@nuxtjs/color-mode": "color-mode",
  "@nuxtjs/i18n": "i18n",
  "@nuxtjs/device": "device",
};

/** @type {import('@grayprint/create').Template} */
export default {
  name: "nuxtyy",
  runtimes: ["node", "bun"],
  options: [{
    name: "tailwind",
    question: "Do you want to use tailwind?",
    type: "boolean",
  }, {
    name: "prettier",
    question: "Do you want to use prettier?",
    type: "boolean",
  }, {
    name: "modules",
    question: "What modules do you want to install alongside",
    type: "list",
    multiple: true,
    options: Object.entries(moduleMap).map(([k, v]) => ({
      title: k,
      description: v,
    })),
  }],
  autoInstallDeps: true,
  cfg: {
    git: true,
  },
  create: async (context) => {
    /** @type {string[]} */
    const modules = context.config.modules;
    await context.packages.exec(
      "nuxi",
      "init",
      "--gitInit",
      "--packageManager",
      context.packageManager,
      "-M",
      modules.map((m) => moduleMap[m]).join(","),
      context.path.ROOT,
    );

    if (context.config.prettier) {
      await context.use(context.tools.prettier, {
        eslint: modules.map((m) => moduleMap[m]).includes("eslint"),
        tailwind: context.config.tailwind !== undefined,
      });
    }

    if (context.config.tailwind) {
      /** TODO: In the future use @nuxtjs/tailwindcss */
      await context.use(context.tools.tailwind, {
        vite: true,
        cssFile: "./app/assets/css/tailwind.css",
      });
    }

    context.dotEnv("KEY", "VALUE", {
      type: "example",
    });

    context.log(`NOTE: To complete set up, You will need to:
- modify your nuxt.config.ts file to use tailwind (the css file is at "./app/assets/css/tailwind.css")
        `);
  },
};
