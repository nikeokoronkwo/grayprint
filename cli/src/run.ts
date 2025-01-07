import {
  BaseTemplate,
  TemplatePackageManager,
  TemplateRuntime,
} from "@grayprint/core";
// @deno-types="npm:@types/prompts@2.4.9"
import prompt from "npm:prompts@2.4.2";
import { optionToPrompt } from "./runner/questionnaire.ts";
import { getValue } from "./utils/getValue.ts";
import { buildContext } from "./runner/context.ts";
import { Application } from "./apps/base.ts";
import { TemplateIdentifier, TemplateType } from "./plugin.ts";
import { blue } from "jsr:@std/fmt@1.0.2/colors";

/** Runs a template */
export async function runTemplate(template: BaseTemplate, options?: {
  ident?: TemplateIdentifier;
  cwd?: string;
}) {
  // first of all, get the template name
  const templName = template.name;

  // get the options
  const opts = template.options;
  const optionPrompts = opts.map((o, _, a) => optionToPrompt(o, a));

  // run questionnaire based on options
  // TODO(@nikeokoronkwo): Arrangement and consideration of 'dependsOn' option
  const optResults = await prompt(optionPrompts);

  // get all the values from each questionnaire, and assign it as a value to an object
  // make this the config object
  let config: Record<string, string | boolean | string[]> = {};
  for (const [key, value] of Object.entries(optResults)) {
    config[key] = getValue(key, value, opts);
  }

  if (!config["runtime"] && template.runtimes.length === 1) {
    config["runtime"] = template.runtimes[0];
  }

  // create a pre-application context
  const preContext = buildContext(templName, config, opts);
  // run the beforeCreate command with the given context
  const addedConfig = template.beforeCreate
    ? await template.beforeCreate(preContext)
    : {};
  config = { ...config, ...addedConfig };

  // build the application context
  const context = template.beforeCreate
    ? new Application({
      name: templName,
      templateType: options?.ident?.type ?? TemplateType.Core,
      typescript: preContext.config["typescript"] as boolean | undefined ??
        false,
      runtime: preContext.config["runtime"] as TemplateRuntime,
      cwd: options?.cwd ?? Deno.cwd(),
      config,
      git: preContext.config["git"] as boolean | undefined ?? true,
    })
    : Application.fromContext(preContext, {
      templateType: options?.ident?.type ?? TemplateType.Core,
    });

  if (template.runtimes.length === 1) {
    const v = template.runtimes[0];
    if (v === "node") {
      if (config["packageManager"] || config["package_manager"]) {
        context.addPackageManager(
          (config["packageManager"] || config["package_manager"]).toString()
            .toLowerCase() as TemplatePackageManager,
        );
      } else context.addPackageManager("npm");
    }
  } else if (config["packageManager"] || config["package_manager"]) {
    const v =
      ((config["packageManager"] || config["package_manager"]) as string)
        .toLowerCase() as TemplatePackageManager;
    context.addPackageManager(v);
  }

  // run the app with the create command
  // this includes: building and running any tools used
  const app = await template.create(context);

  console.info("Adding updated config info...");
  await context.dumpConfig();

  if (template.autoInstallDeps) {
    console.log(blue("Installing dependencies..."));
    await context.installDependencies();
  }
}
