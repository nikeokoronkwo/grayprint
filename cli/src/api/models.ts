export interface TemplatesResponse {
  templates: Template[];
}

export type TemplateIdResponse = DetailedTemplate;

export interface TemplateIdVersionResponse {
  name: string;
  key: string;
  description: string;
  version: string;
  created_at: Date;
  hosted: boolean;
  host_type: "github" | "npm" | "jsr" | "hosted";
  host_source: string;
  tags: string[];
  author: {
    name: string;
    email: string;
  };
  owned?: true;
  archive?: string;
  config: string;
  host_ref?: string;
  pkg_ref?: string;
}

// ====== Models Used =======

interface Template {
  name: string;
  key: string;
  description: string;
  latest_version: string;
  created_at: Date;
  updated_at: Date;
  hosted: boolean;
  host_type: "github" | "npm" | "jsr" | "hosted" | "git";
  tags: string[];
}

interface DetailedTemplate extends Template {
  versions: {
    version: string;
  }[];
  author: {
    name: string;
    email: string;
  };
}
