import { BaseTemplate, commonQuestions } from "@boilerplate/core";

interface CoreTemplate extends BaseTemplate {
  name: "core";
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
        validate: v => {
          if (v.length <= 1 || v === '') return 'You must specify a valid name for your project (at least two characters)'
          else if (v.includes(' ')) return 'You cannot have a name with spaces, use "_" to separate'
          else return true;
        }
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
    beforeCreate: async (app) => {
      let meta;
      let backend;
      let swc;

      // get a metaframework
      if (app.config["vite"] === "No") {
        if (app.config["frontend"] === "Vanilla") {
          backend = await app.question({
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
            meta = await app.question({
              name: "metaframework",
              question: "What metaframework do you want to use?",
              options: metaOptions,
            });
        }
      } else if (app.config['frontend'] === 'React') {
        swc = app.question({
          name: 'swc',
          question: 'Will you be using React with SWC?',
          type: "boolean",
          default: false
        })
      }

      // check if the user wants to integrate a mobile application
      let mobile_framework;
      const mobile = await app.question({
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
        const mobile_framework = await app.question({
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
      // check necessary options

      // scaffold application

      // scaffold framework
      if (app.config['vite'] !== 'No') {
        const templ = getViteTemplate(app.config['frontend'], app.config['typescript'], )
        // scaffold vite application
        if (app.config['vite'] === 'SSR') app.run(...app.commands.create, app.runtime === 'deno' ? 'npm:create-vite@latest' : 'vite@latest', templ)
        else app.run(...app.commands.create, app.runtime === 'deno' ? 'npm:create-vite-extra@latest' : 'vite-extra@latest', templ)
      } else {
        // scaffold metaframework
      }
      
      // scaffold application if any
      // expo app will need to be created and then diffed, and tsconfig.json would be merged
    },
  };
}

function getViteTemplate(name: string, typescript: boolean, reactSwc?: boolean): string {
  return name.toLowerCase() + (reactSwc ? '-swc' : '') + (typescript ? '-ts' : '');
}