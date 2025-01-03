/** File used for loading and defining plugins */

import { loadConfig } from "npm:c12";
import { BaseTemplate } from "../../packages/core/mod.ts";

export enum TemplateType {
    Core, // only one template: main template
    Github,
    Builtin,
}

/**
 * Get the URL for the template identified
 * @param identifier 
 */
export function getTemplateUrl(identifier: string): URL {
    // basic: URL of file path
    // 
    throw new Error('Unimplemented')
}

/**
 * Get the Template contents as a string
 * @param identifier 
 */
export function getTemplateType(identifier: string): TemplateType {
    throw new Error('Unimplemented')
}

export function getBuiltinTemplate(identifier: string): BaseTemplate {
    throw new Error('Unimplemented')

}

export function getTemplate(url: URL): BaseTemplate {
    throw new Error('Unimplemented')

}