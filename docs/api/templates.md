# Templates

```bash
pnpm run boilerplate # core template
pnpm run boilerplate -t static # static builtin template
pnpm run boilerplate -t ../main.js # Reads template from given file
pnpm run boilerplate -t ./core # Reads a `boilerplate.config.js` or `boilerplate.yaml` template file
pnpm run boilerplate -t zen # Reads a template from the Boilerplate Marketplace
pnpm run boilerplate -t npm:@nikeokoronkwo/bp-static # Reads a template from the NPM package "@nikeokoronkwo/bp-static"
pnpm run boilerplate -t gh:nikeokoronkwo/bp-static # Reads a template from the Github Repository "nikeokoronkwo/bp-static"
pnpm run boilerplate -t https://deno.land/x/nike/mod.ts # Reads a template from the file served at the given URL
```

Specify more options
