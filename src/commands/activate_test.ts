import { assertStringIncludes } from "@std/assert";
import { assertRejects } from "@std/assert";
import { makeActivateCommand } from "@/commands/activate.ts";

Deno.test("makeActivateCommand prints bash shell function", async () => {
  const cmd = makeActivateCommand();
  const output: string[] = [];
  const orig = console.log;
  console.log = (msg: string) => output.push(msg);
  try {
    await cmd.parse(["bash"]);
  } finally {
    console.log = orig;
  }
  assertStringIncludes(output.join("\n"), "hokura()");
});

Deno.test("makeActivateCommand prints fish shell function", async () => {
  const cmd = makeActivateCommand();
  const output: string[] = [];
  const orig = console.log;
  console.log = (msg: string) => output.push(msg);
  try {
    await cmd.parse(["fish"]);
  } finally {
    console.log = orig;
  }
  assertStringIncludes(output.join("\n"), "function hokura");
});

Deno.test("makeActivateCommand throws on unsupported shell", async () => {
  const cmd = makeActivateCommand();
  await assertRejects(
    () => cmd.parse(["powershell"]),
    Error,
    "Unsupported shell: powershell",
  );
});
