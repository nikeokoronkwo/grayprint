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
