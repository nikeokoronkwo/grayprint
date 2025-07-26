import { Args, parseArgs } from "jsr:@std/cli/parse-args";
import { getParsedTemplate } from "./src/cli.ts";
import { runTemplate } from "./src/index.ts";

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
  config: {
    type: "string",
    alias: "c",
    usage:
      'Unless a config file is passed, specify the config file to use. Defaults to "grayprint.config.{js,ts}" if any',
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
      .filter(([_, v]) => v.type === "string")
      .map(([k, _]) => k),
    boolean: flagEntries
      .filter(([_, v]) => v.type === "boolean")
      .map(([k, _]) => k),
    alias: flagEntries
      .filter(([_, v]) => v.alias)
      .reduce((a, [k, v]) => ({ ...a, [k]: v.alias }), {}),
  }) as Args;
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

if (import.meta.main) {
  const args = parseArguments(Deno.args);

  if (args.help) {
    printUsage();
    Deno.exit(0);
  }

  // once we get args, deduce type
  const template = await getParsedTemplate(args.template, args.config);

  // get template type
  if (args.unpack) {
    await template?.unpack(args._[0] as string);
    Deno.exit(0);
  }

  // run template
  if (template) await runTemplate(template, args._[0] as string);
  else {
    console.error("Could not get template");
    Deno.exit(1);
  }
}
