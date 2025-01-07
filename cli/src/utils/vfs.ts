/**
 * The Virtual File System Implementation
 */

import { join } from "jsr:@std/path@1.0.8/join";

export abstract class VFileSystemEntity {
  abstract get name(): string;
  abstract set name(v: string);

  abstract dump(dir?: string): void;
}

export abstract class VFile extends VFileSystemEntity {
  abstract contents: string;

  override dump(dir?: string): void {
    Deno.writeTextFileSync(join(dir ?? ".", this.name), this.contents);
  }
}

export abstract class VDirectory extends VFileSystemEntity {
  abstract override name: string;

  abstract files: VFileSystemEntity[];

  add(...files: VFileSystemEntity[]) {
    this.files = this.files.concat(files);
    return this;
  }

  dumpDir(dir?: string): void {
    Deno.mkdirSync(join(dir ?? ".", this.name), { recursive: true });
  }

  override dump(dir?: string) {
    this.dumpDir(dir);
    this.files.forEach((f) => f.dump(join(dir ?? ".", this.name)));
  }
}
