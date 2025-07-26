import { defineCoreTool } from "./base.ts";

export default defineCoreTool({
  name: "sass",
  version: "latest",
  init(context) {
    context.packages.add(["sass"], { dev: true });
  },
});
