import { loadSync } from 'jsr:@std/dotenv';

type TemplateRuntime = 'deno' | 'node' | 'bun';
type TemplatePackageManager = 'deno' | 'bun' | 'npm' | 'pnpm' | 'yarn';
type TemplateOptionType = 'string' | 'boolean' | 'list';

interface BaseTemplateOptions<T extends TemplateOptionType> {
    name: string,
    question: string,
    type?: T,
    dependsOn?: string,
    dependsIf?: (v: string | boolean | string[]) => boolean,
    /** Whether the option is a secure option, like a password */
    secure?: boolean,
}

interface StringTemplateOptions extends BaseTemplateOptions<'string'> {
    default?: string
}

interface BooleanTemplateOptions extends BaseTemplateOptions<'boolean'> {
    default?: boolean
}

interface ListTemplateOptions<T extends string = string> extends BaseTemplateOptions<'list'> {
    options: T[] | ((v: T) => T[]),
    multiple?: boolean,
}

type TemplateOptions = StringTemplateOptions | BooleanTemplateOptions | ListTemplateOptions

export const commonQuestions: {
    platform: TemplateOptions,
    typescript: TemplateOptions,
    packageManager: TemplateOptions
} = {
    platform: {
        name: 'platform',
        question: 'What platform are you designing for?',
        type: 'list',
        options: ['deno', 'node', 'bun']
    },
    typescript: {
        name: 'typescript',
        question: 'Do you want to use typescript?',
        type: 'boolean',
        default: true
    },
    packageManager: {
        name: 'package_manager',
        question: 'What package manager do you want to use?',
        type: "list",
        dependsOn: 'platform',
        options: (v) => {
            const items = ['npm', 'pnpm', 'yarn'];
            if (v === 'bun') items.push('bun');
            else if (v === 'deno') items.push('deno');
            return items;
        }
    }
}

type DefaultValue<T extends TemplateOptions> =
  (
    T['type'] extends 'string' ? string :
    T['type'] extends 'boolean' ? boolean :
    T['type'] extends 'list' ? string[] :
    string
  );

type TemplateConfig<T extends TemplateOptions[]> = {
  [K in T[number] as K['name']]: DefaultValue<K> | undefined;
};

interface TemplateContext<T extends TemplateOptions[]> {
    config: TemplateConfig<T>,
    /** Run a cli question for the given  */
    question: (q: TemplateOptions) => DefaultValue<typeof q>;
    // deno-lint-ignore no-explicit-any
    log: (msg: any) => void;


}

interface TemplateBuiltContext<T extends TemplateOptions[]> extends TemplateContext<T> {
    env: TemplateEnv,
    typescript: boolean,
    runtime: TemplateRuntime,
    packageManager: TemplatePackageManager,
    use: (tool: TemplateTool) => void,
    install: (tool: string) => void,
    run: (...args: string[]) => void,
    path: TemplatePaths,
    copyFile: (from: string, dest: string) => void,
    copyDir: (from: string, dest: string) => void,
}

interface TemplatePaths {
    ROOT: string,
}

interface TemplateTool {}

/** @todo Implement */
abstract class TemplateEnv {
    private env: Map<string, string>;

    constructor() {
        this.env = new Map(Object.entries(loadSync({ export: true })));
    }

    get(name: string) {
        return this.env.get(name) ?? Deno.env.get(name);
    }
    set(name: string, value: string) {
        return this.env.set(name, value);
    }

    dump(envFile?: string): string {
        return Array.from(this.env.entries()).map((key, value) => `${key}="${value}"`).join("\n");
    }
}

export interface BaseTemplate {
    name: string,
    runtimes: TemplateRuntime[],
    options: TemplateOptions[],
    beforeCreate?: (app: TemplateContext<this['options']>) => Record<string, any>,
    tools?: TemplateTool[],
    create: (app: TemplateBuiltContext<this['options']>) => void,
}

interface CoreTemplate extends BaseTemplate {
    name: 'core',
}

export function defineCoreTemplate(): CoreTemplate {
    const frontendOptions = ['React', 'Preact', 'Svelte', 'Vue', 'Solid', 'Qwik', 'Vanilla'];
    return {
        name: 'core',
        runtimes: ['deno', 'bun', 'node'],
        options: [commonQuestions.platform, {
            name: 'name',
            question: 'What is the name of your project?'
        }, {
            name: 'frontend',
            question: 'What frontend framework do you want to use?',
            type: 'list',
            options: frontendOptions
        }, commonQuestions.typescript, {
            name: 'vite',
            question: 'Do you want to use Vite for this?',
            type: 'list',
            options: ['SPA', 'SSR', 'No']
        }, {
            name: 'styles', 
            question: 'What styling options do you want to use for your project?',
            dependsOn: 'frontend',
            multiple: true,
            options: ['tailwind', 'sass', 'less', 'stylus', 'stylex']
        }, {
            name: 'eslint',
            question: 'Do you want to use ESLint?',
            type: 'boolean',
            default: true
        }, {
            name: 'prettier',
            question: 'Do you want to use prettier?',
            type: 'boolean',
            default: true
        }],
        beforeCreate: (app) => {
            let meta;
            let backend;
            
            // get a metaframework
            if (app.config['vite'] === 'No') {
                if (app.config['frontend'] === 'vanilla') {
                    backend = app.question({
                        name: 'backend',
                        question: 'What backend framework do you want to use?',
                        options: ['express', app.config['platform'] ?? 'isomorphic']
                    });
                }

                let metaOptions: string[] = [];
                switch (app.config['frontend']) {
                    case 'React': 
                        metaOptions = ['NextJS', 'Remix', 'Gatsby'];
                        break;
                    case 'Svelte':
                        meta = 'SvelteKit'
                        app.log(`Metaframework defaulting to ${meta}...`);
                        break;
                    case 'Vue':
                        meta = 'Nuxt'
                        app.log(`Metaframework defaulting to ${meta}...`);
                        break;
                    case 'Solid':
                        meta = 'Nuxt'
                        app.log(`Metaframework defaulting to ${meta}...`);
                        break;
                    case 'Qwik':
                        meta = 'QwikCity'
                        app.log(`Metaframework defaulting to ${meta}...`);
                        break;
                    case 'Preact':
                        if (app.config['platform'] === 'deno') {
                            meta = 'Fresh',
                            app.log(`Metaframework defaulting to ${meta}...`);
                            break;
                        }
                }

                if (!meta || metaOptions.length !== 0) meta = app.question({
                    name: 'metaframework',
                    question: 'What metaframework do you want to use?',
                    options: metaOptions
                });
            }

            // check if the user wants to integrate a mobile application
            let mobile_framework;
            const mobile = app.question({
                name: 'application',
                question: 'Do you want to make a mobile application as well?',
                type: 'boolean',
                default: false
            });

            if (mobile) {
                const mobile_framework_options = ['Capacitor', 'NativeScript'];
                switch (app.config['frontend']) {
                    case 'React':
                        mobile_framework_options.push('React Native', 'Ionic', 'NativeScript')
                        break;
                    case 'Vue':
                        mobile_framework_options.push('Ionic')
                        break;
                    case 'Angular':
                        mobile_framework_options.push('Ionic')
                        break;
                    default:
                        break;
                }
                const mobile_framework = app.question({
                    name: 'mobile_framework',
                    question: 'What mobile application framework do you want to use?',
                    type: 'list',
                    options: mobile_framework_options
                });
            }

            return {
                mobile_framework,
                meta,
                backend
            }
        },
        /** @todo Make tools like eslint 'tools' rather than 'options' */
        tools: [],
        create: (app) => {
            console.log(`Building ${app.config['name']}`);

            // copy directories
            
        }
    };
}

export interface Template extends BaseTemplate {

}
