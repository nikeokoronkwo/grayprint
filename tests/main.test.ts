Deno.test("Testing Grayprint CLI", async (t) => {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "./cli/main.ts", "-t", "./tests/demo"],
    cwd: Deno.cwd(),
    stdin: "piped",
    stdout: "piped",
  });
});
