import { BaseTool, TemplateBuiltContext, TemplateContext, TemplateCommands, TemplateEnv, TemplateOptions, TemplatePackageManager, TemplatePaths, TemplateRuntime } from "@boilerplate/core";
import { TemplateConfig } from "./utils/config.ts";
import { TemplateType } from "./plugin.ts";

/**
 * The main application class
 */
export class Application<T extends TemplateConfig = TemplateConfig> implements TemplateBuiltContext {
    private templateType: TemplateType

    constructor(options: {
        typescript: boolean,
        config: T,
        templateType?: TemplateType,
        runtime?: TemplateRuntime
    }) {
        this.typescript = options.typescript;
        this.config = options.config;

        this.templateType = options.templateType ?? TemplateType.Path,

        /** @todo Default should be a function to infer runtime from available in path */
        this.runtime = 'node';
        this.packageManager = 'npm';
        this.commands

        this.env = new TemplateEnv();
    }

    addEnv(env: TemplateEnv) {
        this.env = env;
    }

    addPackageManager(pm: TemplatePackageManager) {
        if (pm === 'bun') {
            this.runtime = 'bun';
        } else if (pm === 'deno') {
            this.runtime = 'deno';
        } else {
            this.runtime = 'node';
        }
    }

    env: TemplateEnv;
    typescript: boolean;
    runtime: TemplateRuntime;
    packageManager: TemplatePackageManager;
    use: (tool: BaseTool) => void;
    install: (tool: string) => void;
    run: (...args: string[]) => void;
    path: TemplatePaths;
    copyFile: (from: string, dest: string) => void;
    copyDir: (from: string, dest: string) => void;
    tools: { tailwind: BaseTool; eslint: BaseTool; sass: BaseTool; prettier: BaseTool; };
    config: T;
    question: (q: TemplateOptions) => PromiseLike<string | boolean | string[]>;
    log: (msg: any) => void;
    commands: TemplateCommands;

    static fromContext(context: TemplateContext): Application {
        throw new Error("Unimplemented");
    }
}