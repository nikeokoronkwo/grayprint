import { TemplateOptions } from "@boilerplate/core";
// @deno-types="npm:@types/prompts"
import { Choice, PromptObject } from "npm:prompts";

/** @todo Add more question options */
export function optionToPrompt(option: TemplateOptions, options: TemplateOptions[]): PromptObject {
    console.log(option);
    switch (option.type) {
        case 'boolean':
            return {
                type: 'confirm',
                name: option.name,
                message: option.question,
                initial: option.default
            };
        case 'string':
            return {
                type: 'text',
                name: option.name,
                message: option.question,
            };
        case 'list':
            return {
                type: option.multiple ? 'multiselect' : 'select',
                name: option.name,
                message: option.question,
                choices: typeof option.options === 'function' ? /* unimplemented */ [] : option.options.map(m => ({ title: m, value: m }))
            };
        default:
            return {
                type: 'text',
                name: option.name,
                message: option.question,
            };
    }
}