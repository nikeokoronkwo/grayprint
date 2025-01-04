import { build, emptyDir } from "jsr:@deno/dnt";
import cliJson from "../cli/deno.json" with { type: 'json' }

await emptyDir("./npm");

await build({
  entryPoints: [{
    kind: 'bin',
    name: 'grayprint',
    path: "cli/main.ts"
  }],
  outDir: "./npm",
  scriptModule: false,
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  importMap: 'deno.json',
  package: {
    // package.json properties
    name: "grayprint",
    version: cliJson.version,
    description: "Grayprint is a command-line tool that makes it easier to setup your projects with ease.",
    // license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/nikeokoronkwo/grayprint.git",
    },
    bugs: {
      url: "https://github.com/nikeokoronkwo/grayprint/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});