import { parseArgs } from "jsr:@std/cli@1.0.9";
import { join, isAbsolute } from "jsr:@std/path@1.0.8";
import { defineCoreTemplate } from "./src/builtin/core.ts";
import {
  getBuiltinTemplate,
  getTemplate,
  parseTemplateIdentifier,
  TemplateType,
} from "./src/plugin.ts";
import { runTemplate } from "./src/run.ts";
import { BaseTemplate } from "@grayprint/core";
import { unpackTemplate } from "./src/unpack.ts";

type FlagType = "boolean" | "string" | "list";

const flags: {
  [k: string]: {
    type: FlagType;
    alias?: string;
    required?: boolean;
    usage?: string;
    default?: string | boolean | string[];
  };
} = {
  help: {
    type: "boolean",
    alias: "h",
    usage: "Prints out help information",
  },
  template: {
    type: "string",
    alias: "t",
    usage: "Specifies a template to use to generate grayprint code",
  },
  unpack: {
    type: "boolean",
    alias: "u",
    usage:
      "Just copy and paste the code in the given template as the final template",
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
      `\t${info.alias ? "-" + info.alias + "," : "   "} --${flag}${
        info.type === "string" ? " <value>" : "\t"
      }\t${info.usage ?? ""}`,
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

const parsedTempl = args.template
  ? parseTemplateIdentifier(args.template)
  : undefined;
const templateType = parsedTempl ? parsedTempl.type : TemplateType.Core;
// run basic template
/** @todo Find a better way to do this */
const template: BaseTemplate = parsedTempl
  ? templateType === TemplateType.Builtin
    ? getBuiltinTemplate(parsedTempl)
    : await getTemplate(parsedTempl, cwd)
  : defineCoreTemplate();

// console.group('Template Information')
// console.info(template)
// console.info(templateType)
// console.info(parsedTempl)
// console.groupEnd()

if (args.unpack) {
  // unpack template
  await unpackTemplate(template, parsedTempl, {
    cwd,
  });
} else {
  // run template
  await runTemplate(template, {
    ident: parsedTempl,
    cwd,
  });
}

Deno.exit(0);
