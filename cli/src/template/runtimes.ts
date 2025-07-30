import { spawnSync } from "node:child_process";

const runtimes = ["node", "deno", "bun"] as const;
export type Runtime = (typeof runtimes)[number];
export function checkAvailableRuntimes(): Promise<Runtime[]> {
  return Promise.all(
    runtimes.map((r) => {
      return ((r === "deno"
          ? checkIfExecutableExists(Deno.execPath())
          : checkIfExecutableExists(r)))
        ? r
        : undefined;
    }).filter((v) => v !== undefined),
  ) as Promise<Runtime[]>;
}

function checkIfExecutableExists(name: string): boolean {
  try {
    return (spawnSync(name, { encoding: 'utf8' })).status === 0;
  } catch (_) {
    return false;
  }
}
