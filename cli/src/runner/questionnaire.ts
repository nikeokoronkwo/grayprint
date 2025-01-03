import { TemplateOptions } from "@boilerplate/core";
// @deno-types="npm:@types/prompts"
import { PromptObject } from "npm:prompts";

/** @todo Add more question options */
export function optionToPrompt(option: TemplateOptions): PromptObject {
    switch (option.type) {
        case 'boolean':
            return {
                type: 'confirm',
                name: option.name,
                message: option.question
            };
        case 'string':
            return {
                type: 'text',
                name: option.name,
                message: option.question,
            };
            break;
        case 'list':
            return {
                type: option.multiple ? 'multiselect' : 'select',
                name: option.name,
                message: option.question,
            };
            break;
    }
    throw new Error('Template Option not supported');
}