import { assertEquals, assertRejects } from "@std/assert";
import { makeInitCommand } from "@/commands/init.ts";
import type { Settings } from "@/settings.ts";

Deno.test("makeInitCommand creates git repo in empty dir", async () => {
  const tmp = await Deno.makeTempDir();
  const workingDir = `${tmp}/dotfiles`;
  const settings: Settings = { workingDir, vars: {} };

  const cmd = makeInitCommand(settings);
  await cmd.parse([]);

  const gitDir = await Deno.stat(`${workingDir}/.git`);
  assertEquals(gitDir.isDirectory, true);
  await Deno.remove(tmp, { recursive: true });
});

Deno.test("makeInitCommand errors on non-empty dir without --force", async () => {
  const tmp = await Deno.makeTempDir();
  const workingDir = `${tmp}/dotfiles`;
  await Deno.mkdir(workingDir, { recursive: true });
  await Deno.writeTextFile(`${workingDir}/existing.txt`, "hello");
  const settings: Settings = { workingDir, vars: {} };

  const cmd = makeInitCommand(settings);
  await assertRejects(
    () => cmd.parse([]),
    Error,
    "is not empty",
  );

  await Deno.remove(tmp, { recursive: true });
});

Deno.test("makeInitCommand succeeds on non-empty dir with --force", async () => {
  const tmp = await Deno.makeTempDir();
  const workingDir = `${tmp}/dotfiles`;
  await Deno.mkdir(workingDir, { recursive: true });
  await Deno.writeTextFile(`${workingDir}/existing.txt`, "hello");
  const settings: Settings = { workingDir, vars: {} };

  const cmd = makeInitCommand(settings);
  await cmd.parse(["--force"]);

  const gitDir = await Deno.stat(`${workingDir}/.git`);
  assertEquals(gitDir.isDirectory, true);
  await Deno.remove(tmp, { recursive: true });
});
