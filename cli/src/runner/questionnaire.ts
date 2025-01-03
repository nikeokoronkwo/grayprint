import { TemplateOptions } from "@boilerplate/core";
// @deno-types="npm:@types/prompts"
import { Choice, PromptObject } from "npm:prompts";

/** 
 * @todo Add more question options:
 * - Validate
 * - Format
 * - Hints
 * - Title and description in options
 */
export function optionToPrompt(option: TemplateOptions, options: TemplateOptions[]): PromptObject {
    if (option.type === 'boolean') {
        return {
            type: 'confirm',
            name: option.name,
            message: option.question,
            initial: option.default
        };
    } else if (option.type === 'list' || 'options' in option) {
        return option.multiple ? {
            type: 'multiselect',
            name: option.name,
            message: option.question,
            choices: typeof option.options === 'function' ? /* unimplemented */ [] : option.options.map(m => ({ title: m }))
        } : {
            type: 'select',
            name: option.name,
            message: option.question,
            choices: typeof option.options === 'function' ? /* unimplemented */ [] : option.options.map(m => ({ title: m }))
        };
    } else {
        return {
            type: 'text',
            name: option.name,
            message: option.question,
            validate: option.type === 'string' || Object.keys(option).includes('validate') ? option.validate : undefined
        };
    }
}