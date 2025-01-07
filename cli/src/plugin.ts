/** File used for loading and defining plugins */

import { loadConfig } from "npm:c12";
import { BaseTemplate } from "@grayprint/core";
import { defineCoreTemplate } from "./builtin/core.ts";
import { octokit } from "./plugin/github.ts";
import { join } from "jsr:@std/path@1/join";

export enum TemplateType {
  Core, // only one template: main template
  Builtin,
  Path,
  Github,
  NPM,
  JSR,
}

export interface ScopedParts {
  scope?: string;
  name: string;
}

interface SingleParts {
  path: string;
}

export interface TemplateIdentifier {
  type: TemplateType;
  parts: ScopedParts | SingleParts;
}

export function parseTemplateIdentifier(ident: string): TemplateIdentifier {
  if (ident.split(":").length < 2) {
    return {
      type: TemplateType.Path,
      parts: {
        path: ident,
      },
    };
  }
  const [id, pkg] = ident.split(":");
  switch (id) {
    case "gh":
    case "github": {
      const [user, name] = pkg.split("/");
      return {
        type: TemplateType.Github,
        parts: {
          scope: user,
          name,
        },
      };
    }

    case "npm": {
      if (pkg.split.length === 1) {
        return {
          type: TemplateType.NPM,
          parts: {
            name: pkg,
          },
        };
      }
      const [user, name] = pkg.split("/");
      return {
        type: TemplateType.NPM,
        parts: {
          scope: user,
          name,
        },
      };
    }
    case "jsr": {
      const [user, name] = pkg.split("/");
      return {
        type: TemplateType.JSR,
        parts: {
          scope: user,
          name,
        },
      };
    }
    default:
      throw new Error(`Unknown/Unexpected Identifier ${id}`);
  }
}

/**
 * Get the URL for the template identified
 * @param identifier
 */
export function getTemplateUrl(templ: TemplateIdentifier): URL {
  // basic: URL of file path
  //
  throw new Error("Unimplemented");
}

export function getBuiltinTemplate(
  identifier: TemplateIdentifier,
): BaseTemplate {
  throw new Error("Unimplemented");
}

export async function getTemplate(
  templ: TemplateIdentifier,
  cwd?: string,
): Promise<BaseTemplate> {
  switch (templ.type) {
    case TemplateType.Core:
      return defineCoreTemplate();
    case TemplateType.Builtin:
      throw new Error(
        "Builtin templates have not yet been implemented. For more information see: ",
      );
    case TemplateType.Path:
      return await getTemplateFromPath((templ.parts as SingleParts).path, cwd);
    case TemplateType.Github:
      return await getGithubTemplate(
        (templ.parts as ScopedParts).name,
        (templ.parts as ScopedParts).scope!,
      );
    case TemplateType.NPM:
      return await getNPMTemplate(
        (templ.parts as ScopedParts).name,
        (templ.parts as ScopedParts).scope,
      );
    case TemplateType.JSR:
      return await getJSRTemplate(
        (templ.parts as ScopedParts).name,
        (templ.parts as ScopedParts).scope!,
      );
  }
}

async function getGithubTemplate(
  repo: string,
  name: string,
): Promise<BaseTemplate> {
  try {
    // todo: Use own import method
    // Use esm.sh
    return (await import(
      `https://esm.sh/gh/${name}/${repo}/grayprint.config.js`
    )).default as BaseTemplate;
  } catch (error) {
    // handle error
    throw new Error((error as Error).message);
  }
}

async function getNPMTemplate(
  name: string,
  scope?: string,
): Promise<BaseTemplate> {
  try {
    return (await import(`https://esm.sh/${scope ? `${scope}/${name}` : name}`))
      .default as BaseTemplate;
  } catch (error) {
    // handle error
    throw new Error((error as Error).message);
  }
}

async function getTemplateFromPath(path: string, cwd?: string) {
  const { config } = await loadConfig<BaseTemplate>({
    cwd: cwd ? join(cwd, path) : path,
  });
  return config;
}

async function getJSRTemplate(name: string, scope: string) {
  // use esm.sh
  try {
    return (await import(
      `https://esm.sh/jsr/${scope}/${name}/grayprint.config.js`
    )).default as BaseTemplate;
  } catch (error) {
    // handle error
    throw new Error((error as Error).message);
  }
}

export function isBuiltinTemplate(identifier: string) {
  throw new Error("Unimplemented");
}
