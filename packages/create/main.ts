/**
 * @fileoverview The Grayprint Creator Package CLI, for publishing and helping in creating packages
 */

import { Command } from "npm:commander";
const program = new Command();

program
  .name("grayprint")
  .description("Creating awesome templates")
  .version("0.1.0");

program.command("login")
  .description("Log onto GrayPrint for publishing and working with templates");

program.command("publish")
  .description("Publish your template to GrayPrint")
  .argument("<string>", "string to split")
  .option("--first", "display just the first substring")
  .option("-s, --separator <char>", "separator character", ",")
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

program.parse(
  Deno.args,
);
