import { TemplateContext, TemplateOptions, TemplateConfig } from "@boilerplate/core";
// @deno-types="npm:@types/prompts"
import prompts from "npm:prompts";

import { optionToPrompt } from "./questionnaire.ts";
import { getValue } from "../utils/getValue.ts";

export function buildContext<T extends TemplateOptions[] = TemplateOptions[]>(
  name: string,
  config: TemplateConfig<T>,
  options: T,
): TemplateContext<T> {
  return {
    name,
    async question(q) {
      const optionsContext = options.concat(q);
      const result = await prompts(optionToPrompt(q, optionsContext));
      const [r] = Object.entries(result);
      return getValue(r[0], r[1], optionsContext);
    },
    config,
    /** @todo Better logger for `log` and `error` */
    log: console.log,
    error(msg) {
      console.error(msg);
      throw new Error(msg);
    },
  };
}
