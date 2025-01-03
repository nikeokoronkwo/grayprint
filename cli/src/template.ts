import { BaseTemplate, commonQuestions } from "@boilerplate/core";

interface CoreTemplate extends BaseTemplate {
  name: "core";
}


class Framework {
    name: string;
    frontend?: FrontendFramework;
    meta?: MetaFramework[];
    backend?: string[];
    mobile?: string[];
  
    constructor(
      name: string,
      options: {
        meta?: MetaFramework[];
        frontend?: FrontendFramework;
        backend?: string[];
        mobile?: string[];
      } = {},
    ) {
      this.name = name;
      this.meta = options.meta;
      this.backend = options.backend;
      this.mobile = options.mobile;
    }
  }
  
  class FrontendFramework {
      name: string;
      vite?: boolean;
      pkgName?: string;
      scaffold?: () => void;
  
      constructor(name: string, options?: {
          vite?: boolean,
          pkgName?: string,
          scaffold?: () => void;
      }) {
          this.name = name;
          this.vite = options?.vite;
          this.pkgName = options?.pkgName;
          this.scaffold = options?.scaffold;
      }
  }
  
  class MetaFramework {
    name: string;
    pkgName?: string;
    pkgScaffold?: (name: string) => void;
  
    constructor(name: string, scaffold?: string | ((name: string) => void)) {
      this.name = name;
      if (typeof scaffold === "string") this.pkgName = scaffold;
      else this.pkgScaffold = scaffold;
    }
  }
  

const frameworks = {
    react: {
        name: 'React',
        meta: [{
            name: 'NextJS',
            // When scaffolding nextjs app, run deno install afterwards
            scaffold: (options) => {
                return [
                    ...options.packageInstaller, 'create-next',
                    options['tailwind'] ? '--tailwind' : '--no-tailwind',
                    options['eslint'] ? '--eslint' : '--no-eslint',
                    options['typescript'] ? '--typescript' : '--javascript',
                    options.packageManager === 'deno' ? '--skip-install' : `--use-${options.packageManager}`
                ].join(' ');
            }
        }, {
            name: 'Remix',
            scaffold: (options) => {
                return [
                    ...options.commands.create, 'remix',
                    '-y', options.config['name'],
                    '--no-git-init', '--package-manager', options.packageManager
                ].join(' ');
            }
        }],
        apps: [{
            name: 'React Native',
            scaffoldOnOwn: true, 
            scaffold: (options) => {
                // todo
            }
        }, {
            name: 'Ionic',
            scaffoldOnOwn: true,
            scaffold: (options) => {
                
            }
        }]
    },
    preact: {
        name: 'Preact'
    },
    angular: {},
    vue: {},
    solid: {},
    qwik: {},
    vanilla: {},
}

export function defineCoreTemplate(): CoreTemplate {
  const frontendOptions = [
    "React",
    "Preact",
    "Svelte",
    "Vue",
    "Solid",
    "Qwik",
    "Vanilla",
    "Angular",
  ];
  return {
    name: "core",
    runtimes: ["deno", "bun", "node"],
    options: [
      commonQuestions.platform,
      {
        name: "name",
        question: "What is the name of your project?",
      },
      {
        name: "frontend",
        question: "What frontend framework do you want to use?",
        type: "list",
        options: frontendOptions,
      },
      commonQuestions.typescript,
      {
        name: "vite",
        question: "Do you want to use Vite for this?",
        type: "list",
        options: ["SPA", "SSR", "No"],
      },
      {
        name: "styles",
        question: "What styling options do you want to use for your project?",
        dependsOn: "frontend",
        multiple: true,
        options: ["tailwind", "sass", "less", "stylus", "stylex"],
      },
      {
        name: "eslint",
        question: "Do you want to use ESLint?",
        type: "boolean",
        default: true,
      },
      {
        name: "prettier",
        question: "Do you want to use prettier?",
        type: "boolean",
        default: true,
      },
      {
        name: 'git',
        question: 'Do you want to use Git for your project?',
        type: "boolean",
        default: true
      }
    ],
    beforeCreate: (app) => {
      let meta;
      let backend;

      // get a metaframework
      if (app.config["vite"] === "No") {
        if (app.config["frontend"] === "Vanilla") {
          backend = app.question({
            name: "backend",
            question: "What backend framework do you want to use?",
            options: ["express", app.config["platform"] ?? "isomorphic"],
          });
        } else if (app.config["frontend"] === "Angular") {
          // angular options
        } else {
          let metaOptions: string[] = [];
          switch (app.config["frontend"]) {
            case "React":
              metaOptions = ["NextJS", "Remix", "Gatsby"];
              break;
            case "Svelte":
              meta = "SvelteKit";
              app.log(`Metaframework defaulting to ${meta}...`);
              break;
            case "Vue":
              meta = "Nuxt";
              app.log(`Metaframework defaulting to ${meta}...`);
              break;
            case "Solid":
              meta = "Nuxt";
              app.log(`Metaframework defaulting to ${meta}...`);
              break;
            case "Qwik":
              meta = "QwikCity";
              app.log(`Metaframework defaulting to ${meta}...`);
              break;
            case "Preact":
              if (app.config["platform"] === "deno") {
                (meta = "Fresh"),
                  app.log(`Metaframework defaulting to ${meta}...`);
                break;
              }
          }

          if (!meta || metaOptions.length !== 0)
            meta = app.question({
              name: "metaframework",
              question: "What metaframework do you want to use?",
              options: metaOptions,
            });
        }
      }

      // check if the user wants to integrate a mobile application
      let mobile_framework;
      const mobile = app.question({
        name: "application",
        question: "Do you want to make a mobile application as well?",
        type: "boolean",
        default: false,
      });

      if (mobile) {
        const mobile_framework_options = ["Capacitor", "NativeScript"];
        switch (app.config["frontend"]) {
          case "React":
            mobile_framework_options.push(
              "React Native",
              "Ionic",
              "NativeScript",
            );
            break;
          case "Vue":
            mobile_framework_options.push("Ionic");
            break;
          case "Angular":
            mobile_framework_options.push("Ionic");
            break;
          default:
            break;
        }
        const mobile_framework = app.question({
          name: "mobile_framework",
          question: "What mobile application framework do you want to use?",
          type: "list",
          options: mobile_framework_options,
        });
      }

      return {
        mobile_framework,
        meta,
        backend,
      };
    },
    /** @todo Make tools like eslint 'tools' rather than 'options' */
    tools: [],
    create: (app) => {
      console.log(`Building ${app.config["name"]}`);

      // scaffold application

      // scaffold framework
      if (app.config['vite'] !== 'No') {
        // scaffold vite application
      } else {
        // scaffold metaframework
      }
      
      // scaffold application if any
      // expo app will need to be created and then diffed, and tsconfig.json would be merged
    },
  };
}