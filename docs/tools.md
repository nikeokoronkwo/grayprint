# Tools

Tools are basically individual pieces meant to represent individual utilities that could be incorporated into a project and might require their own configurations, presets and more. These tools can range from development utilities like ESLint or Prettier, to

Say you wanted to install prettier and ESLint for your user's templates. You could perform some manual setup like this

```js
import { defineTemplate } from "@grayprint/create";

export default defineTemplate({
  // ...
  create: (app) => {
    // ...
    // install ESLint
    app.install('eslint', { dev: true });
    app.writeFile('eslint.config.ts', '...');
    // install ESLint plugins for project
    // update config file, etc

    // install Prettier
    app.install('prettier', { dev: true, exact: true });
    // install ESLint Prettier Plugin since Prettier is available
    // ...
  }
});
```

Instead of having to do this yourself, you can make use of modular, composable tools (see the following examples) and make it much easier to run code.

## Using Tools
Tools can be used in many ways

### Direct
Tools that do not require any form of configuration can be input directly into the template via the `tools` property

```js
import { toolA, toolB } from "some-tools-package";

export default defineTemplate({
  // tools
  tools: [toolA, toolB]
});
```

### Programmatic via `app.use`
You can programmatically include tools, as well as pass options to tools via the `app.use` function in the `create` function

```js
import { toolA, toolB } from "some-tools-package";

export default defineTemplate({
  // ...
  create: (app) => {
    // use toolA
    app.use(toolA);

    // use toolB
    app.use(toolB, {
      name: 'some-name'
    });
  }
});
```

## Builtin Tools
There are a few builtin tools available via the `app.tools` record object. The tools supported by Grayprint directly are:
- [TailwindCSS](https://tailwindcss.com/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Sass](https://sass-lang.com/)

You can find the definitions for these tools [here](/cli/src/tools).

If you have any suggestions of tools to implement, we would love to consider. Please file in a feature request with the implementation.


## Making a Tool
Making a tool for others to be able to use or consume works similar to making a template. You can make use of the `defineTool` function from the `@grayprint/create` package. 

Only two properties are needed: `name` (the name of the tool) and `init` (the function used to run/integrate the tool into the project). The major difference between defining a template and that of a tool is that the `init` function for a tool must return back the `context` object.

The context passed to `init` is derived from the full application context and changes made to it are automatically reflected to the application after the tool is integrated (tools added via the `tools` prop are added after the `create` function has been run)

<!-- Thinking of being able to run tools defined in `tools` parallel to the application being created -- as an optional feature -->

```js
import { defineTool } from "@grayprint/create";

export default defineTool({
    name: 'Tool',
    init: async (context) {
        // access options passed via the `context.options` field
        if (context.options['react']) {
        }

        await context.run(context.commands.run, ['@eslint/config'], {
            // get options from option manager
            'config': context.options['typescript']
        });

        console.log(`Set up TOOL at ${context.path.ROOT}`);

        // run code based on presence of other tools (access by name)
        if (context.tools['prettier']) {
            await context.run(context.packageManager, /* other commands */);
        }
    }
})
```

## TypeScript
You can define types based on the `BaseToolOptions` interface defined in `@grayprint/create`. The interface does not have any defined options by default, and so you can define any necessary properties
```ts
import { defineTool } from "@grayprint/create";
import type { BaseToolOptions } from "@grayprint/create";

interface MyToolOptions extends BaseToolOptions {
  typescript: boolean;
}

export default defineTool<MyToolOptions>({
    name: 'Tool',
    init: async (context) {
        // access options with type safety
        if (context.options.typescript) {
        }

        // ...
    }
})
```
