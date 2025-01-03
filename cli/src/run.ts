import { BaseTemplate, ListTemplateOptions } from "@boilerplate/core";
// @deno-types="npm:@types/prompts"
import prompt from "npm:prompts"
import { optionToPrompt } from "./runner/questionnaire.ts";
import { getValue } from "./utils/getValue.ts";
import { buildContext } from "./runner/context.ts";

/** Runs a template */
export async function runTemplate(template: BaseTemplate, options?: {}) {
    // first of all, get the template name
    const templName = template.name;

    // get the options 
    const opts = template.options;
    const optionPrompts = opts.map((o, _, a) => optionToPrompt(o, a));

    // run questionnaire based on options
    // todo: start with those without a 'dependsOn',
    // todo: arrange the ones with 'dependsOn' before the given option,
    const optResults = await prompt(optionPrompts);

    console.info(optResults)

    // get all the values from each questionnaire, and assign it as a value to an object
    // make this the config object
    const config: Record<string, string | boolean | string[]> = {};
    for (const [key, value] of Object.entries(optResults)) {
        config[key] = getValue(key, value, opts);
    }

    // create a pre-application context
    const preContext = buildContext(config, opts);
    // run the beforeCreate command with the given context
    const addedConfig = template.beforeCreate ? await template.beforeCreate(preContext) : {};

    // build the application context
    
    // run the app with the create command
    // this includes: building and running any tools used
}