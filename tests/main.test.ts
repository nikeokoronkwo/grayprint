import { spawnSync } from "node:child_process"

Deno.test("Testing Grayprint CLI", (_t) => {
  const _ = spawnSync(Deno.execPath(), ["run", "-A", "./cli/main.ts", "-t", "./tests/demo"], {
    cwd: Deno.cwd(),
    encoding: 'utf8'
  });
});
