Deno.test("Testing Grayprint CLI", async (_t) => {
  const _ = await new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "./cli/main.ts", "-t", "./tests/demo"],
    cwd: Deno.cwd(),
    stdin: "piped",
    stdout: "piped",
  }).output();
});
