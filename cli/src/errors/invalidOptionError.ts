import { TemplateOptions } from "@grayprint/core";

export class InvalidOptionError extends TypeError {
    option: TemplateOptions;

    constructor(message: string, opt: TemplateOptions, options?: ErrorOptions) {
        super(message, options);
        this.option = opt;
    }
}