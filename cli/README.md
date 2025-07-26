# Grayprint CLI

The GrayPrint CLI (i.e `create-grayprint`).

If you want to create and publish grayprint templates, see
[@grayprint/create](../packages/create).

## Using the CLI

To invoke the CLI, run the following:

```
deno run -A jsr:@grayprint/cli [options] [path]
```

By default, this invokes the default grayprint template, but you can specify a
template using the `--template` or `-t` flag:

```
deno run -A jsr:@grayprint/cli -t <key> [path]
```

The key could be any of the following:

- The path to a grayprint template (either its directory, or a
  JavaScript/TypeScript file): The directory must have a
  `grayprint.config.{js, ts}` file present.
- An NPM package, specified starting with `npm:<pkg>`. If the package contains a
  grayprint config file,

To get help options

```
deno run -A jsr:@grayprint/cli --help
```
