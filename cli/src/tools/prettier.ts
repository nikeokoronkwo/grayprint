import { PrettierOptions } from "@grayprint/core";
import { defineCoreTool } from "./base.ts";

export default defineCoreTool<PrettierOptions>({
  name: "prettier",
  version: "latest",
  init(context) {
    if (context.runtime === "deno") {
      context.addScript("fmt", "deno run -A npm:prettier . --write");
    } else {
      context.packages.add(["prettier"], { dev: true, exact: true });
      context.addScript("fmt", "prettier . --write");
    }

    context.writeFile(
      ".prettierignore",
      "# Ignore artifacts:\nbuild\ncoverage\n",
    );

    if (context.options?.eslint) {
      context.packages.add(["eslint-prettier-config"], { dev: true });
    }

    if (context.options.tailwind) {
      context.packages.add(["prettier-plugin-tailwindcss"], { dev: true });
      context.writeFile(
        ".prettierrc",
        `{"plugins": ["prettier-plugin-tailwindcss"]}`,
      );
    } else {
      context.writeFile(".prettierrc", "{}");
    }
  },
});
