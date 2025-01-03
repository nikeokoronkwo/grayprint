import { TemplateContext, TemplateOptions } from "@boilerplate/core";
// @deno-types="npm:@types/prompts"
import prompts from "npm:prompts";

import { optionToPrompt } from "./questionnaire.ts";
import { getValue } from "../utils/getValue.ts";
import { TemplateConfig } from "../utils/config.ts";

export function buildContext(config: TemplateConfig, options: TemplateOptions[]): TemplateContext {
    return {
        async question(q) {
            const optionsContext = options.concat(q)
            const result = await prompts(optionToPrompt(q, optionsContext));
            const [r] = Object.entries(result);
            return getValue(r[0], r[1], optionsContext);
        },
        config,
        /** @todo Better logger */
        log: console.log
    }
}