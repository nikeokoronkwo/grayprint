# Templates
Templates are what power boilerplate. They are the blueprint that shows and tells how boilerplate should

Templates make it easy for you to scaffold a project, while also allowing you to easily configure a project.

## Getting Started
Templates can either be static templates via a YAML file, or programmatic templates with a JS/TS configuration file.

> Note: The YAML specification for templates is not ready at the moment, and does not work. At the moment, you will have to make use of JS configs

## Using a Template
Templates can be used by specifying them with the `-t` or `--template` flag.

```bash
boilerplate # core template
boilerplate -t static # static builtin template
boilerplate -t ../main.js # Reads template from given file
boilerplate -t ./core # Reads a `boilerplate.config.js` or `boilerplate.yaml` template file
boilerplate -t zen # Reads a template from the Boilerplate Marketplace
boilerplate -t npm:@nikeokoronkwo/bp-static # Reads a template from the NPM package "@nikeokoronkwo/bp-static"
boilerplate -t gh:nikeokoronkwo/bp-static # Reads a template from the Github Repository "nikeokoronkwo/bp-static"
boilerplate -t https://deno.land/x/nike/mod.ts # Reads a template from the file served at the given URL
```

<!-- Specify more options by  -->

## Creating your own Template
Creating a boilerplate template can be done with the `@boilerplate/create` package. This package is platform-agnostic, (as most of the APIs are implemented in the CLI) and available on JSR to use.

To begin, install the package:
```bash
deno add @boilerplate/create
npx jsr add @boilerplate/create
pnpm dlx jsr add @boilerplate/create
yarn dlx jsr add @boilerplate/create
bunx jsr add @boilerplate/create
```

Then create a `boilerplate.config.js` file with the following:
```js
import {defineTemplate} from "@boilerplate/create";

export default defineTemplate({
  name: 'my-template', // the name of the template
  options: [],
  create: (app) => {
    // create the template
  }
})
```

The only required fields for the given function are `name`, `options` and `create`.

`name` is used to specify the name of your template. The template should have a name, especially if you plan for another user to make use of this template.
`options` are used to specify prompts that can be passed in the command line to get user information, and can be accessed in the `create` function to configure creation of your template.
The `create` function is used to actually "create" the "boilerplate". The `create` function is passed an `app` object, which contains a lot of utilities and methods that you can use to scaffold an application, such as `packageManager` and `runtime` to get the needed/specified (if specified) package manager and runtime to use, `env` for getting and setting environment variables, as well as for creating `.env` files in the project, and `use` for making use of [tools]().

<!-- You can also run `boilerplate -t template` to create a "boilerplate" template for you-->

For more information on the `defineTemplate` function, [check out the docs on JSR]().

### Example 1:
This example is used to copy a `template` directory from the current directory of the template config file to the user's directory where his/her project is specified. This is a common practice used in most scaffolding applications.

```ts
import {defineTemplate} from "@boilerplate/create";

export default defineTemplate({
  name: 'my-template', // the name of the template
  options: [],
  create: (app) => {
    // copies the content from the 'template' directory to the user's project root
    app.copyDir('template', app.path.ROOT);
  }
})
```

### Extensive Example
```js
import { defineTemplate, commonQuestions } from "@boilerplate/create";
import { myTool } from "@example/myTool"

export default defineTemplate({
    name: 'Template',
    runtimes: 'all',
    options: [{
        name: 'name',
        question: 'What is the name of your project?'
    }, {
        name: 'react',
        question: 'Do we use react?',
        type: 'boolean'
    },
    // access to commonly asked questions
    commonQuestions.typescript],

    // run code before
    beforeCreate: (config) => {
        if (config['react']) {

            // can ask more questions in case more info is needed
            // automatically added to config afterwards
            const angular = app.question({
                statement: `Should We Use Angular?`,
                type: 'boolean'
            });
        }
    },
    // add tools to install as well
    tools: []
    create: (app) => {
        console.log(`Building ${app.config['name']}`);

        // copy directories
        app.copyDir('template', '.');

        // add environment variables
        app.env('FOO', 'bar', {
            // dev - '.env.dev', prod - '.env.prod' and so on
            type: 'dev'
        });

        // use tools
        // you can use this for programmatic operations of tools
        app.use(app.tools.eslint, {

        });

        // use tools with config options
        app.use(myTool, {
            'db': 'postgres'
        })

        // or define custom work to incorporate a tool
        app.install('esbuild');

        // run commands
        app.run(app.commands.install);
        app.run(app.commands.add('prettier'));
        app.run(app.packageManager, ['status']);
    }
})
```

### TypeScript
Types can be used for specifying the desired types for resolved options.
