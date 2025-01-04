# Boilerplate

Boilerplate is a command-line tool that makes it easier to setup your projects with ease. By simply running the command-line tool, you can scaffold any kind of project you want!

Boilerplate makes it possible to easily make and share project templates for people to use, with support for authentication, user-provided information, .env files, and more!

## Getting Started
To begin using boilerplate, you will need to install it.

While the packages used for developing boilerplate are platform-agnostic (and available via JSR), the CLI itself uses Deno-specific APIs and so is available in

### Deno
The boilerplate CLI is available via `deno.land/x`

```bash
deno install -A deno.land/x/boilerplate/main.ts
```

### Node/Bun
The boilerplate CLI has been built for Node and is available as an NPM package

```bash
npm install -g boilerplate # npm
pnpm add -g boilerplate # pnpm
```

### Other
Boilerplate is also available as a binary that can be installed via [the releases page]() for this repository.

## Custom Template
Making a custom template is simple. Your templates can be described with a `boilerplate.yaml` file, or programmatically with a `boilerplate.config.js` file.
Boilerplate supports getting and using templates from the user's system (via path), Github (Public and Private Repositories), NPM, JSR, and direct URLs.

For more information on making custom templates, [check out the documentation]().

You can also take a look at the templates used for [the builtin templates in `boilerplate`](./cli/src/core).
