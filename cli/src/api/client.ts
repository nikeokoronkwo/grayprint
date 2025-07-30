import {
  TemplateIdResponse,
  TemplateIdVersionResponse,
  TemplatesResponse,
} from "./models.ts";

export interface GrayPrintAPI {
  getTemplates(): Promise<TemplatesResponse>;
  getTemplateByKey(key: string): Promise<TemplateIdResponse>;
  getTemplateByKeyAndVersion(
    key: string,
    version: string,
  ): Promise<TemplateIdVersionResponse>;
}

export class GrayPrintClient implements GrayPrintAPI {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint.endsWith("/")
      ? endpoint.slice(0, endpoint.length - 1)
      : endpoint;
  }

  async getTemplates(): Promise<TemplatesResponse> {
    return await fetch(`${this.endpoint}/api/templates`)
      .then(async (r) => await r.json() as TemplatesResponse);
  }

  async getTemplateByKey(key: string): Promise<TemplateIdResponse> {
    return await fetch(`${this.endpoint}/api/templates/${key}`)
      .then(async (r) => await r.json() as TemplateIdResponse);
  }

  async getTemplateByKeyAndVersion(
    key: string,
    version: string,
  ): Promise<TemplateIdVersionResponse> {
    return await fetch(`${this.endpoint}/api/templates/${key}/${version}`)
      .then(async (r) => await r.json() as TemplateIdVersionResponse);
  }
}
