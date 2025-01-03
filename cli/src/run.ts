import { BaseTemplate } from "@boilerplate/core";
// @deno-types="npm:@types/prompts"
import prompts from "npm:prompts"
import { optionToPrompt } from "./runner/questionnaire.ts";

export class Application {

}

/** Runs a template */
export function runTemplate(template: BaseTemplate, options?: {}) {
    // first of all, get the template name
    const templName = template.name;

    // get the options 
    const opts = template.options;
    const optResults = prompts(opts.map(optionToPrompt));

    // run questionnaire based on options
    // start with those without a 'dependsOn',
    // arrange the ones with 'dependsOn' before the given option,

    // get all the values from each questionnaire, and assign it as a value to an object
    // make this the config object

    // create a pre-application context
    // run the beforeCreate command with the given context

    // build the application context
    // run the app with the create command
    // this includes: building and running any tools used
}