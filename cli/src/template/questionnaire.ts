import {
  Option as TemplateChoiceOption,
  TemplateOptions,
} from "@grayprint/core";
// @deno-types="npm:@types/prompts@2.4.9"
import { PromptObject } from "npm:prompts@2.4.2";
import { InvalidOptionError } from "../errors/invalidOptionError.ts";

/**
 * Add more question options:
 * - Format
 * - Hints
 * - Title and description in options
 */
export function optionToPrompt(
  option: TemplateOptions,
): PromptObject {
  if (option.type === "boolean") {
    return {
      type: "confirm",
      name: option.name,
      message: option.question,
      initial: option.default,
    };
  } else if ("options" in option) {
    if (typeof option.options === "function") {
      throw new InvalidOptionError(
        "Options as functions are not implemented yet. File an issue",
        option,
      );
    }
    return option.multiple
      ? {
        type: "multiselect",
        name: option.name,
        message: option.question,
        choices: option.options.map((
          m: string | TemplateChoiceOption,
        ) => (typeof m === "string" ? { title: m } : m)),
      }
      : {
        type: "select",
        name: option.name,
        message: option.question,
        choices: option.options.map((
          m: string | TemplateChoiceOption,
        ) => (typeof m === "string" ? { title: m } : m)),
      };
  } else {
    return "validate" in option
      ? {
        type: "text",
        name: option.name,
        message: option.question,
        validate: option.validate,
      }
      : {
        type: "text",
        name: option.name,
        message: option.question,
      };
  }
}
