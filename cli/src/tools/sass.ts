import { defineCoreTool } from "./base.ts";

export default defineCoreTool({
    name: 'sass',
    init(context) {
      context.installSync('sass', { dev: true });
    },
});
