import { TemplateBuiltConfig } from "../utils/config.ts";
import { Application, ApplicationOptions } from "./base.ts";
import { VDirectory, VFile, VFileSystemEntity } from "../utils/vfs.ts";
import { join } from "jsr:@std/path@^1.0.8";

abstract class GFileSystemIdentity extends VFileSystemEntity {
  abstract load(): Promise<void>;
}

const GFile = class extends VFile implements GFileSystemIdentity {
  override get name(): string {
    return this.obj.name;
  }

  preObj: any;
  obj: any = {};

  constructor(obj: object) {
    super();
    this.preObj = obj;
  }

  contents = "";

  async load() {
    const c = await fetch(this.obj.url).then(async (res) => await res.json());

    this.obj = c;
    this.contents = new TextDecoder(c.encoding ?? "base64").decode(
      c.contents,
    );
  }
};
const GDir = class extends VDirectory implements GFileSystemIdentity {
  override name: string;
  override get files(): VFileSystemEntity[] {
    return this.obj.map((o: any) => {
      if (o.type === "dir") return new GDir(o, o.name);
      else if (o.type === "file") return new GFile(o);
      else throw new Error(`Unsupported File System: ${o}`);
    });
  }

  preObj: any;
  obj: any = {};

  constructor(obj: object, name: string) {
    super();
    this.preObj = obj;
    this.name = name;
  }

  load(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  override async dump(dir?: string): Promise<void> {
    super.dumpDir(dir);
    for (const f of this.files) {
      if (f instanceof GFile) await f.load();
      else if (f instanceof GDir) await f.load();
      f.dump(join(dir ?? ".", this.name));
    }
  }
};

/**
 * A built application context to be used for templates from Github
 */
export class GithubApplication<
  T extends TemplateBuiltConfig = TemplateBuiltConfig,
> extends Application<T> {
  repoName: string;
  repoUser: string;
  repoDir?: string;

  constructor(
    options: ApplicationOptions<T> & {
      repoName: string;
      repoDir?: string;
      repoUser: string;
    },
  ) {
    super(options);
    this.repoName = options.repoName;
    this.repoUser = options.repoUser;
    this.repoDir = options.repoDir;
  }

  async load(
    dir?: string,
    file?: boolean,
  ) {
    return await loadGithubDir(
      this.repoUser,
      this.repoName,
      this.repoDir,
      file,
      dir,
    );
  }

  override copyFile(from: string, dest: string): void {}

  override copyDir(from: string, dest: string): void {
    // if (isAbsolute(from)) throw new Error("Cannot make use of absolute paths");
    // const dir = this.load(from);
  }
}

export async function loadGithubDir(
  repoUser: string,
  repoName: string,
  repoDir?: string,
  file?: boolean,
  dir?: string,
) {
  const finalDir = repoDir
    ? (dir ? join(repoDir, dir) : repoDir)
    : (dir ? dir : undefined);

  const data = await fetch(
    `https://api.github.com/repos/${repoUser}/${repoName}/contents${
      finalDir ? `/${finalDir}` : ""
    }`,
  ).then(async (r) => await r.json());

  if (file === true) {
    return new TextDecoder(data.encoding ?? "base64").decode(
      data.contents,
    );
  }

  return {
    name: repoDir ?? ".",
    files: data.map((d: any) => {
      if (d.type === "file") return new GFile(d);
      else if (d.type === "dir") return new GDir(d, d.name);
      else throw new Error("Unsupported file");
    }),
    async dump(dir: string) {
      Deno.mkdirSync(dir);
      for (const f of this.files) {
        if (f instanceof GFile) await f.load();
        else if (f instanceof GDir) await f.load();

        f.dump(join(dir ?? ".", this.name));
      }
    },
  };
}
