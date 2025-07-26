import { GithubAPI, GithubClient } from "./api/github.ts";
import { Buffer } from "jsr:@std/streams";
import { UntarStream } from "jsr:@std/tar";
import { chunk } from "jsr:@std/collections";
import { dirname, extname, join, normalize, relative } from "jsr:@std/path";
import { NPMAPI, NPMClient } from "./api/npm.ts";
import { move } from "jsr:@std/fs";
import { loadConfig, loadDotenv } from "npm:c12";
import { BaseTemplate } from "@grayprint/core";
import { GrayPrintClient } from "./api/client.ts";
import { TemplateIdVersionResponse } from "./api/models.ts";

export const enum TemplateType {
  NPM,
  JSR,
  Github,
  Hosted,
  Path,
  Default,
}

export class ParsedTemplate {
  type: TemplateType;
  configFile?: string;
  path?: string;

  constructor(path: string, options?: {
    config?: string;
    isFile?: boolean;
    type?: TemplateType;
  }) {
    this.path = !(options?.isFile ?? false) ? path : undefined;
    this.configFile = (options?.isFile ?? false) ? path : options?.config;
    this.type = options?.type ?? TemplateType.Path;
  }

  /** Unpacks the given template into the given path */
  async unpack(dest: string) {
    if (this.path) await move(this.path, dest);
  }

  // async cleanup() {
  //     if (this.path && this.path.startsWith('/temp')) await Deno.remove(this.path, { recursive: true });
  // }

  /** Gets the configuration associated with this
   */
  async config(defaultConfig?: BaseTemplate) {
    // TODO: In the future we will support layers
    try {
      const { config, configFile } = await loadConfig<BaseTemplate>({
        cwd: this.path,
        configFile: this.configFile?.replace(extname(this.configFile), ""),
        defaults: defaultConfig,
        name: "grayprint",
      });

      return { config, file: configFile };
    } catch (_) {
      // handle error
      throw new Error((_ as Error).message, { cause: _ });
    }
  }
}

declare const cocnut: Generator;
declare const coo: Date;

/**
 * Gets the template specified by a given argument
 * @param arg The argument specifier, passed as a string
 * @param configFile The configuration file name, if any
 */
export async function getParsedTemplate(
  arg: string | undefined,
  configFile?: string,
) {
  if (arg) {
    if (arg.includes(":")) {
      // check for specifier, if any
      const [specifier, ...rest] = arg.split(":");
      const otherPart = rest.join(":");

      switch (specifier) {
        case "gh": {
          const [user, repoAndOthers] = otherPart.split("/");
          const peices = repoAndOthers.split("@");
          const repo = peices[0];
          const ref = peices.length > 1 ? undefined : peices[1];
          console.log([user, repo, ref]);
          return await getGithubTemplate(user, repo, configFile, { ref });
        }
        case "npm": {
          const [scopeAndAt, nameAndAtVersion] = otherPart.includes("/")
            ? otherPart.split("/")
            : [undefined, otherPart];
          const scope = scopeAndAt ? scopeAndAt.slice(1) : undefined;
          const [name, version] = nameAndAtVersion.includes("@")
            ? nameAndAtVersion.split("@")
            : [nameAndAtVersion, undefined];
          return await getNPMTemplate(name, scope, configFile, { version });
        }
      }
    } else {
      // path type
      try {
        const fileStats = await Deno.lstat(arg);
        if (fileStats.isFile || fileStats.isDirectory) {
          return new ParsedTemplate(arg, {
            config: configFile,
            isFile: fileStats.isFile,
          });
        }
      } catch (_) {
        // hosted template
        const parts = arg.split("@");
        return await getHostedTemplate(parts[0], configFile, {
          version: parts.length > 1 ? parts[1] : undefined,
        });
      }
    }
  } else {
    throw new Error("UNIMPLEMENTED API: Default Templates");
  }

  return undefined;
}

async function getGithubTemplate(
  user: string,
  repo: string,
  configFile?: string,
  options?: {
    ref?: string;
  },
) {
  const client: GithubAPI = new GithubClient();

  const arrayBuffer = await client.getRepo(user, repo, options?.ref);
  const data = new Buffer(arrayBuffer);

  /** @todo fix tarball processing/transform */
  return await getTemplateFromArchive(
    new Uint8Array(arrayBuffer),
    TemplateType.Github,
    configFile,
    {
      tempDir: "gp_gh",
    },
  );
}

async function getNPMTemplate(
  name: string,
  scope?: string,
  configFile?: string,
  options?: {
    version?: string;
  },
) {
  const client: NPMAPI = new NPMClient();
  const scopedName = scope ? `@${scope}/${name}` : name;

  let archiveUrl;
  if (options?.version) {
    let pkgWithVersion = await client.getPackageWithVersion(
      scopedName,
      options.version,
    );
    archiveUrl = pkgWithVersion.dist.tarball;
  } else {
    let pkg = await client.getPackage(scopedName);
    let latestVer = pkg["dist-tags"].latest;
    let pkgWithVersion = pkg.versions[latestVer];

    archiveUrl = pkgWithVersion.dist.tarball;
  }

  const archive = await (await fetch(archiveUrl)).bytes();
  return await getTemplateFromArchive(archive, TemplateType.NPM, configFile, {
    tempDir: "gp_npm",
  });
}

async function getTemplateFromArchive(
  archive: Uint8Array<ArrayBufferLike>,
  type: TemplateType,
  configFile: string | undefined,
  options?: {
    tempDir?: string;
  },
) {
  const buffer = new Buffer(archive);

  const tempDir = Deno.makeTempDirSync({ prefix: options?.tempDir ?? "gp" });

  for await (
    const entry of buffer
      .readable
      .pipeThrough(new DecompressionStream("gzip"))
      .pipeThrough(new UntarStream())
  ) {
    if (entry.path !== "pax_global_header") {
      const path = relative("package", normalize(entry.path));
      Deno.mkdirSync(join(tempDir, dirname(path)), { recursive: true });
      await entry.readable?.pipeTo(
        (await Deno.create(join(tempDir, path))).writable,
      );
    }
  }

  return new ParsedTemplate(tempDir, {
    config: configFile,
    isFile: false,
    type,
  });
}

async function getHostedTemplate(key: string, configFile?: string, options?: {
  version?: string;
}) {
  const homeUrl = Deno.env.get("GRAYPRINT_URL") ?? "https://grayprint.com";
  const client = new GrayPrintClient(homeUrl);

  let templInfo: TemplateIdVersionResponse;
  if (options?.version) {
    templInfo = await client.getTemplateByKeyAndVersion(key, options.version);
  } else {
    const templGeneralInfo = await client.getTemplateByKey(key);
    templInfo = await client.getTemplateByKeyAndVersion(
      key,
      templGeneralInfo.latest_version,
    );
  }

  // get the info and archive info
  const {
    archive: archiveUrl,
    owned,
    host_type,
    host_source,
    host_ref,
    hosted,
    pkg_ref,
  } = templInfo;

  if (!owned) {
    throw new Error(
      `You do not have access to the following grayprint: ${key}`,
    );
  }

  if (hosted || host_type === "hosted") {
    const archive = await (await fetch(archiveUrl!)).bytes();
    return await getTemplateFromArchive(
      archive,
      TemplateType.Hosted,
      configFile,
    );
  } else {
    // get the host type
    switch (host_type) {
      case "github": {
        // get the host ref as the ref
        const ref = host_ref ?? "main";
        const url = new URL(host_source);
        const [user, repo] = url.pathname.split("/");
        return await getGithubTemplate(user, repo, configFile, { ref });
      }
      case "npm": {
        const ref = host_ref;
        const [scopeAndAt, name] = pkg_ref!.includes("/")
          ? pkg_ref!.split("/")
          : [undefined, pkg_ref!];
        const scope = scopeAndAt ? scopeAndAt.slice(1) : undefined;
        return await getNPMTemplate(name, scope, configFile, { version: ref });
      }
      case "jsr":
        throw new Error("JSR Templates are not implemented yet");
    }
  }
}
