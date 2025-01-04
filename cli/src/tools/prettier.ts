import { BaseToolOptions } from "@grayprint/core";
import { defineCoreTool } from "./base.ts";

interface PrettierOptions extends BaseToolOptions {
    /** Whether prettier is available */
    eslint: boolean
}

export default defineCoreTool<PrettierOptions>({
    name: 'prettier',
    init(context) {
        if (context.runtime === 'deno') {
            context.addScript('fmt', 'deno run -A npm:prettier . --write')
        } else {
            context.installSync('prettier', { dev: true, exact: true });
            context.addScript('fmt', 'prettier . --write')
        }

        context.runSync('node', '--eval', `"fs.writeFileSync('.prettierrc','{}\n')"`);
        context.runSync('node', '--eval', `"fs.writeFileSync('.prettierignore','# Ignore artifacts:\nbuild\ncoverage\n')"`);

        if (context.options.eslint) {
            context.install('eslint-prettier-config');
        }
    },
});
