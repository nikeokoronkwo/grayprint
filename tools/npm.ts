import { build, emptyDir } from "jsr:@deno/dnt@0.42.3";
import cliJson from "../cli/deno.json" with { type: "json" };

await emptyDir("./npm");

const [
  { status: cliResultStatus, ...cliInfo },
  { status: createResultStatus, ...createInfo }
] = await Promise.allSettled([
  /** Build the CLI */
  buildGPCli(),
  buildGPCreate()
])

console.log('CLI Build: ', cliResultStatus === 'fulfilled' ? 'success': 'failed');
console.log('Create Build: ', createResultStatus === 'fulfilled' ? 'success': 'failed');


async function buildGPCreate() {
  await build({
    entryPoints: ['./packages/create/mod.ts', {
      kind: "bin",
      name: "grayprint",
      path: "./packages/create/main.ts",
    }],
    filterDiagnostic(diagnostic) {
      if (diagnostic.file?.fileName.includes("deps/jsr.io") ||
        [2554, 2339, 2304].includes(diagnostic.code) // TODO(nikeokoronkwo): May not ignore 2339
      ) {
        return false; // ignore all diagnostics from dependencies
      }
      return true;
    },
    outDir: "./npm/create",
    scriptModule: false,
    shims: {
      // see JS docs for overview and more options
      deno: true,
    },
    importMap: "deno.json",
    package: {
      // package.json properties
      name: "@grayprint/create",
      version: cliJson.version,
      description: "Create a grayprint template or tool easily and quickly",
      license: "MIT",
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
      Deno.copyFileSync("LICENSE", "npm/create/LICENSE");
      Deno.copyFileSync("README.md", "npm/create/README.md");
    },
  });
}

async function buildGPCli() {
  await build({
    entryPoints: [{
      kind: "bin",
      name: "create-grayprint",
      path: "./cli/main.ts",
    }],
    filterDiagnostic(diagnostic) {
      if (diagnostic.file?.fileName.includes("deps/jsr.io") ||
        [2554, 2339, 2304].includes(diagnostic.code) // TODO(nikeokoronkwo): May not ignore 2339
      ) {
        return false; // ignore all diagnostics from dependencies
      }
      return true;
    },
    outDir: "./npm/cli",
    scriptModule: false,
    shims: {
      // see JS docs for overview and more options
      deno: true,
      custom: []
    },
    importMap: "deno.json",
    package: {
      // package.json properties
      name: "create-grayprint",
      version: cliJson.version,
      description: "Grayprint is a command-line tool that makes it easier to setup your projects with ease.",
      license: "MIT",
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
      Deno.copyFileSync("LICENSE", "npm/cli/LICENSE");
      Deno.copyFileSync("README.md", "npm/cli/README.md");
    },
  });
}
