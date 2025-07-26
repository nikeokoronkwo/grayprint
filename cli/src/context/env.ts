import { TemplateEnv } from "@grayprint/core";

export class TemplateEnvImpl implements TemplateEnv {
  get(name: string): string | undefined {
    return Deno.env.get(name);
  }

  set(name: string, value: string): void {
    return Deno.env.set(name, value);
  }
}
