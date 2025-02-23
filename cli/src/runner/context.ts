import {
  TemplateConfig,
  TemplateContext,
  TemplateOptions,
} from "@grayprint/core";
// @deno-types="npm:@types/prompts@2.4.9"
import prompts from "npm:prompts@2.4.2";

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
    configFile: {},
    /** @todo Better logger for `log` and `error` */
    log: console.log,
    error(msg) {
      console.error(msg);
      throw new Error(msg);
    },
  };
}
