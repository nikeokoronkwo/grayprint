/**
 * The builtin implementation used for retrieving from the Grayprint Website
 * 
 * The procedure is as follows:
 * - Retrieve package from endpoint
 * - Download to cache/temp directory
 * - Run from the given directory
 * 
 * In the future:
 * - Update API
 * 
 * @todo Implement the builtin application
 */

import { Application, ApplicationOptions } from "./base.ts";
import { TemplateBuiltConfig } from "../utils/config.ts";
import { walkSync } from "jsr:@std/fs@1/walk";
import { relative, isAbsolute, join, extname, basename } from "jsr:@std/path@1";

/** @todo implement this */
export class BuiltinApplication<
  T extends TemplateBuiltConfig = TemplateBuiltConfig,
> extends Application<T> {

    dir: string;

    constructor(options: ApplicationOptions<T>, contentDir: string) {
        super(options);

        // get endpoint for fetching content
        this.dir = contentDir
    }

    
}