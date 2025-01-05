<div style="text-align: center;">

![Grayprint Logo](https://github.com/user-attachments/assets/a1775b2a-a90d-4360-95c5-a1b383515c18)
  
</div>

# Grayprint

Grayprint is a command-line tool that makes it easier to setup your projects
with ease. By simply running the command-line tool, you can scaffold any kind of
project you want!

Grayprint makes it possible to easily make and share project templates for
people to use, with support for authentication, user-provided information, .env
files, and more!

> This project is still a work in progress, and some of the features have either not been implemented yet, or are experimental
> 
> Contributions are always welcome, and if you have any issue do consider filing a bug for it if not avaialble.

## Getting Started

To begin using grayprint, you will need to install it.

While the packages used for developing grayprint are platform-agnostic (and
available via JSR), the CLI itself uses Deno-specific APIs and so is available
in

### Deno

The grayprint CLI is available via `deno.land/x`

```bash
deno install -A deno.land/x/grayprint/main.ts -n grayprint
```

### Node/Bun

The grayprint CLI has been built for Node and is available as an NPM package that can be installed globally

```bash
npm install -g grayprint # npm
pnpm add -g grayprint # pnpm
yarn global add grayprint # yarn
bun add -g grayprint # bun
```

### Other

Grayprint is also available as a binary that can be installed via
[the releases page]() for this repository.

## Custom Template

Making a custom template is simple. Your templates can be described with a
`grayprint.yaml` file, or programmatically with a `grayprint.config.js`
file. Grayprint supports getting and using templates from the user's system
(via path), Github (Public and Private Repositories), NPM, JSR, and direct URLs.

For more information on making custom templates,
[check out the documentation](./docs/templates.md).

You can also take a look at the templates used for
[the builtin templates in `grayprint`](./cli/src/core).
