import { parseArgs } from "jsr:@std/cli";
import { defineCoreTemplate } from "./src/builtin/core.ts";
import {
  getBuiltinTemplate,
  getTemplate,
  getTemplateType,
  getTemplateUrl,
  TemplateType,
} from "./src/plugin.ts";
import { runTemplate } from "./src/run.ts";
import { BaseTemplate } from "@grayprint/core";
import { join } from "jsr:@std/path/join";
import { isAbsolute } from "jsr:@std/path/is-absolute";

type FlagType = "boolean" | "string" | "list";

const flags: {
  [k: string]: {
    type: FlagType;
    alias?: string;
    required?: boolean;
    usage?: string;
  };
} = {
  help: {
    type: "boolean",
    usage: "Prints out help information",
  },
  template: {
    type: "string",
    alias: "t",
    usage: "Specifies a template to use to generate grayprint code",
  },
};
const flagEntries = Object.entries(flags);

/**
 * Parse arguments
 * @param args The arguments from the command line
 */
function parseArguments(args: string[]) {
  return parseArgs(args, {
    string: flagEntries
      .filter(([k, v]) => v.type === "string")
      .map(([k, v]) => k),
    boolean: flagEntries
      .filter(([k, v]) => v.type === "boolean")
      .map(([k, v]) => k),
    alias: flagEntries
      .filter(([k, v]) => v.alias)
      .reduce((a, [k, v]) => ({ ...a, [k]: v.alias }), {}),
  });
}

/** Print out command line usage */
function printUsage() {
  console.log("%cGrayprint", "text-decoration: underline");
  console.log("\nUsage: grayprint [flags] [directory]");
  console.log("\n%cFlags:", "font-weight: bold");
  for (const [flag, info] of flagEntries) {
    console.log(
      `\t${info.alias ? "-" + info.alias + "," : "   "} --${flag}\t\t${
        info.usage ?? ""
      }`,
    );
  }
}

// Get command line arguments
const args = parseArguments(Deno.args);
if (args.help) {
  printUsage();
  Deno.exit(0);
}

const cwd = args._.length === 0
  ? Deno.cwd()
  : (isAbsolute(args._[0] as string))
  ? args._[0] as string
  : join(Deno.cwd(), args._[0] as string);

const templateType = args.template
  ? getTemplateType(args.template)
  : TemplateType.Core;
// run basic template
/** @todo Find a better way to do this */
const template: BaseTemplate = args.template
  ? templateType === TemplateType.Builtin
    ? getBuiltinTemplate(args.template)
    : getTemplate(getTemplateUrl(args.template))
  : defineCoreTemplate();

await runTemplate(template, {
  type: templateType,
  cwd,
});

Deno.exit(0);