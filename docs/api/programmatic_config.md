## Programmatic config

### Template
1. JS compiles basic parts
2. Go runs processes
3. JS Compiles beforeCreate with app object
4. Go receives data and runs command 
5. JS Compiles create
6. Go receives it and runs create command
7. JS receives tools
8. Go installs tools
9. JS Compiles afterCreate with app object
10. Go runs afterCreate

```js
import { defineTemplate, commonQuestions } from "@boilerplate/create";
import { drizzle } from "@example/drizzle"

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
        app.use(app.builtinTools.eslint, {

        });

        // use tools with config options
        app.use(drizzle, {
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

### Tool
```js

import { defineTool } from "@boilerplate/create";

export default defineTool({
    name: 'Tool',
    config: {

    },
    init: (context, runner) {
        // questionnaire
        if (context.options['react']) {
            const react = runner.ask({
                question: 'Are you using react?'
                type: 'boolean'
            });
        }

        runner.run(runner.packageManager.run, ['@eslint/config'], {
            // get options from option manager
            'config': context.options['typescript']
        });

        console.log(`Set up ESLINT at ${context.dir}`);

        // run code based on presence of other tools (access by name)
        if (context.tools['prettier']) {
            context.run(`${context.packageManager}`);
        }
    }
})
```

```ts
import { defineTool } from "@boilerplate/create";

interface InputOptions {

}

interface OutputConfig {

}

export default defineTool<InputOptions, OutputConfig>({
    name: 'Tool',
    init: (context) {
        // get typescript intellisense
    }
})