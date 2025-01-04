import { ListTemplateOptions, TemplateOptions } from "@grayprint/core";

export function getValue(key: string, value: any, opts: TemplateOptions[]) {
  if (typeof value === "number") {
    // index
    const option = opts.find((v) => v.name === key) as ListTemplateOptions;
    return typeof option.options === "function"
      ? /* unimplemented */ []
      : option.options[value];
  } else if (Array.isArray(value)) {
    // array of numbers
    const option = opts.find((v) => v.name === key) as ListTemplateOptions;
    return typeof option.options === "function"
      ? /* unimplemented */ []
      : option.options.filter((_, i) => value.includes(i));
  } else {
    if (typeof value !== "string" && typeof value !== "boolean") {
      throw new Error("Return type from option not supported");
    } else return value;
  }
}
