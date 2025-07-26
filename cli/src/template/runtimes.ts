const runtimes = ["node", "deno", "bun"] as const;
export type Runtime = (typeof runtimes)[number];
export function checkAvailableRuntimes(): Promise<Runtime[]> {
  return Promise.all(
    runtimes.map(async (r) => {
      return (await (r === "deno"
          ? checkIfExecutableExists(Deno.execPath())
          : checkIfExecutableExists(r)))
        ? r
        : undefined;
    }).filter((v) => v !== undefined),
  ) as Promise<Runtime[]>;
}

async function checkIfExecutableExists(name: string): Promise<boolean> {
  try {
    return (await new Deno.Command(name).output()).code === 0;
  } catch (_) {
    return false;
  }
}
