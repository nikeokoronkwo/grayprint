import { BaseToolOptions } from "@grayprint/core";
import { defineCoreTool } from "./base.ts";
import prettier from "npm:@prettier/sync";

interface ESLintOptions extends BaseToolOptions {
    react?: boolean;
    vue?: boolean;
    typescript?: boolean;
    server?: boolean;
    browser?: boolean;
}

export default defineCoreTool<ESLintOptions>({
    name: 'eslint',
    init(context) {
        context.installSync('eslint', { dev: true });
        context.installSync('@eslint/js', { dev: true });

        const configChunks = [`import pluginJs from "@eslint/js";`];

        if (context.options.server || context.options.browser) {
            context.installSync('globals', { dev: true });
            configChunks.push(`import globals from "globals";`)
        }

        if (context.options.react) {
            context.installSync('eslint-plugin-react', { dev: true });
            configChunks.push(`import pluginReact from "eslint-plugin-react";`)
        }
        else if (context.options.vue) {
            context.installSync('eslint-plugin-vue', { dev: true });
            configChunks.push(`import pluginVue from "eslint-plugin-vue";`)
        }

        if (context.options.typescript) {
            context.installSync('typescript-eslint', { dev: true });
            configChunks.push(`import tseslint from "typescript-eslint";`)
        }

        configChunks.push(`
        /** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{${['js','mjs','cjs','ts',...(context.options.typescript ? ['ts'] : []), ...(context.options.vue ? ['vue'] : (context.options.react ? ['tsx', 'jsx'] : []))].join(',')}}"]},
  {languageOptions: ${context.options.browser || context.options.browser ? `{ globals: {${context.options.browser ? '...globals.browser,' : ''} ${context.options.server ? '...globals.node' : ''}} }},` : ''}
  pluginJs.configs.recommended,
  ${context.options.typescript ? '...tseslint.configs.recommended,' : ''}
  ${context.options.react ? 'pluginReact.configs.flat.recommended,' : ''}
  ${context.options.vue ? '...pluginVue.configs["flat/essential"],' : ''}
  
];
        `)

        context.writeFile('eslint.config.js', prettier.format(configChunks.join('\n'), { parser: 'babel' }))
    },
});
