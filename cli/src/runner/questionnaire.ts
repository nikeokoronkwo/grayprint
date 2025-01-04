import { TemplateOptions } from "@boilerplate/core";
// @deno-types="npm:@types/prompts"
import { PromptObject } from "npm:prompts";

/**
 * @todo Add more question options:
 * - Format
 * - Hints
 * - Title and description in options
 */
export function optionToPrompt(
  option: TemplateOptions,
  options: TemplateOptions[],
): PromptObject {
  if (option.type === "boolean") {
    return {
      type: "confirm",
      name: option.name,
      message: option.question,
      initial: option.default,
    };
  } else if (option.type === "list" || "options" in option) {
    if (typeof option.options === 'function') throw new Error('Options as functions are not implemented yet. File an issue')
    return option.multiple
      ? {
        type: "multiselect",
        name: option.name,
        message: option.question,
        choices: option.options.map((m) => ({ title: m })),
      }
      : {
        type: "select",
        name: option.name,
        message: option.question,
        choices: option.options.map((m) => ({ title: m })),
      };
  } else {
    return 'validate' in option ? {
      type: "text",
      name: option.name,
      message: option.question,
      validate: option.validate
    } : {
      type: "text",
      name: option.name,
      message: option.question,
    };
  }
}
