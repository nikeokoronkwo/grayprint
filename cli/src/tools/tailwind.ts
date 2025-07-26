import { defineCoreTool } from "./base.ts";

export default defineCoreTool({
  name: "tailwind",
  version: "^4.1",
  async init(context) {
    const pkgs = ["tailwindcss"];

    if (context.options.vite) pkgs.push("@tailwindcss/vite");
    else if (context.options.postcss) {
      pkgs.push("@tailwindcss/postcss", "postcss");
    }

    context.packages.add(pkgs);

    const cssFile = context.options.cssFile ?? "./src/style.css";

    if (context.fileExists(cssFile)) {
      let contents = (await context.readFile(cssFile)).split("\n");
      contents = [
        "@import 'tailwindcss';\n",
        ...contents,
      ];

      context.writeFile(cssFile, contents.join("\n"));
    } else {
      context.writeFile(cssFile, "@import 'tailwindcss';\n");
    }
  },
});
