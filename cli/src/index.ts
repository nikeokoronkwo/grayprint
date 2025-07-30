import { BaseTemplate, TemplateConfig } from "@grayprint/core";
import { InvalidOptionError } from "./errors/invalidOptionError.ts";
import { ParsedTemplate } from "./fetch_template.ts";
import { getValue } from "./utils/getValue.ts";
import { red, yellow } from "jsr:@std/fmt/colors";
// @deno-types="npm:@types/prompts@^2.4.9"
import prompt from "npm:prompts@^2.4.2";
import { optionToPrompt } from "./template/questionnaire.ts";
import { uppercaseFirstLetter } from "./utils/uppercase.ts";
import { checkAvailableRuntimes, Runtime } from "./template/runtimes.ts";
import { buildTemplatePreContext } from "./context.ts";
import { PackageManager } from "./context/package_manager.ts";
import { dirname, join } from "jsr:@std/path";
import { exists } from "jsr:@std/fs@1";
import { deepMerge } from "jsr:@std/collections";

export async function runTemplate(template: ParsedTemplate, dir: string) {
  const { config, file } = await template.config({
    // unpack by default
    name: "unpack",
    options: [],
    create: async (_) => {
      await template.unpack(dir);
    },
  });

  if (!file) {
    console.warn(yellow("Could not find grayprint configuration for template"));
    console.warn(yellow("Defaulting to unpacking template"));
  }

  return await processConfig(
    config,
    template.path ?? dirname(template.configFile!),
    dir,
  );
}

async function processConfig(
  template: BaseTemplate,
  templateDir: string,
  outputDir: string,
) {
  // begin execution

  // check for available runtimes
  const availableRuntimesPromise = checkAvailableRuntimes();

  // 1. get name of template
  const name = template.name;

  // 2. ask options questions
  const options = template.options;
  let optionPrompts: prompt.PromptObject<string>[] = [];

  try {
    optionPrompts = options.map((o) => optionToPrompt(o));
  } catch (error) {
    if (error instanceof InvalidOptionError) {
      throw error;
    }
    throw new TypeError(
      red(
        "'options' must be passed. If you do not have any options, pass '[]'",
      ),
      { cause: error },
    );
  }

  const optResults = await prompt(optionPrompts);
  const config: TemplateConfig<typeof template.options> = {};
  for (const [key, value] of Object.entries(optResults)) {
    config[key] = getValue(key, value, options);
  }

  // 3. ask additional questions
  // we need runtime and package manager
  let runtime: Runtime;
  let packageManager: PackageManager;

  const specifiedRuntimes = template.runtimes ?? ["deno", "node", "bun"];
  const availableRuntimes = await availableRuntimesPromise;
  const matchedRuntimes = specifiedRuntimes.filter((r) =>
    availableRuntimes.includes(r)
  );

  if (matchedRuntimes.length === 0) {
    throw new Error(
      "Could not find available runtimes, which should be an error",
    );
  }

  if (specifiedRuntimes.length === 1) {
    runtime = specifiedRuntimes[0];
  } else if (matchedRuntimes.length === 1) {
    runtime = matchedRuntimes[0];
  } else {
    const runtimeResult = await prompt({
      name: "runtime",
      type: "select",
      message: "Which runtime are you using for this project",
      choices: matchedRuntimes.map((r) => ({
        title: uppercaseFirstLetter(r),
        value: r,
      })),
    });

    runtime = runtimeResult.runtime;
  }

  if (template.cfg?.packageManager) {
    packageManager = template.cfg.packageManager;
  } else {
    const pkgManagerOptions = ["pnpm", "npm", "yarn"];
    if (runtime === "deno") pkgManagerOptions.push("deno");
    else if (runtime === "bun") pkgManagerOptions.push("bun");

    const pkgManagerResult = await prompt({
      name: "package_manager",
      type: "select",
      message: "Which package manager will you use for this project",
      choices: pkgManagerOptions.map((r) => ({ title: r, value: r })),
    });

    packageManager = pkgManagerResult.package_manager;
  }

  // 4. build template context
  const preContext = buildTemplatePreContext(template, {
    packageManager,
    runtime,
    config,
    name,
  });

  // 5. run beforeCreate
  const beforeCreateCtx = await template.beforeCreate?.(preContext);

  // 6. upgrade context to built context
  const builtContext = preContext.upgradeContext(templateDir, {
    beforeCreateCtx: beforeCreateCtx ?? {},
    typescript: true,
    git: true,
    outputDir,
  });

  const initPkg = template.initPkg ?? false;

  if (initPkg) {
    builtContext.init();
  }

  // 7. run create
  await template.create(builtContext);

  // 7.1 set up tools
  const tools = template.tools ?? [];
  for (const tool of tools) {
    builtContext.use(tool);
  }

  // 7.2 dump env
  const dotEnv = builtContext.dumpDotEnv();
  for (const [file, contents] of dotEnv) {
    Deno.writeTextFileSync(
      join(outputDir, file),
      contents,
    );
  }

  // 7.3 set up ts if not already

  // 7.4 set up git if not already
  if (
    !(await exists(
      join(outputDir, ".git"),
    )) && builtContext.git
  ) {
    builtContext.initGitSync();
  }

  // 7.5 update package.json if any
  let configFromConfigFile = {};
  if (await exists(join(outputDir, "package.json"))) {
    configFromConfigFile = JSON.parse(
      await Deno.readTextFile(join(outputDir, "package.json")),
    );
    await Deno.writeTextFile(
      join(outputDir, "package.json"),
      JSON.stringify(
        deepMerge(configFromConfigFile, builtContext.packageJsonRecord),
      ),
    );
  } else if (await exists(join(outputDir, "deno.json"))) {
    configFromConfigFile = JSON.parse(
      await Deno.readTextFile(join(outputDir, "deno.json")),
    );
    await Deno.writeTextFile(
      join(outputDir, "deno.json"),
      JSON.stringify(
        deepMerge(configFromConfigFile, builtContext.packageJsonRecord),
      ),
    );
  }

  // 8. auto install deps if defined, else ask
  if (!(await exists("node_modules"))) {
    if (template.autoInstallDeps) {
      await builtContext.packages.install();
    } else if (template.autoInstallDeps === undefined) {
      const shouldInstall = await prompt([{
        name: "install_deps",
        type: "confirm",
        message: "Should we install dependencies for you",
      }]);

      if (shouldInstall.install_deps) {
        await builtContext.packages.install();
      }
    }
  }

  // 9. done!
}
