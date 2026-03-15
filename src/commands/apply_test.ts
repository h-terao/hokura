import { assertEquals } from "@std/assert";
import { makeApplyCommand } from "@/commands/apply.ts";
import type { Settings } from "@/settings.ts";
import { withFakeHome } from "@/test_utils.ts";

Deno.test("makeApplyCommand dry-run lists files", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(fakeHome, { recursive: true });
    await Deno.mkdir(`${workingDir}/home/.config`, { recursive: true });
    await Deno.writeTextFile(`${workingDir}/home/.bashrc`, "hello");
    await Deno.writeTextFile(`${workingDir}/home/.config/fish.conf`, "fish");

    const settings: Settings = { workingDir, vars: {} };
    const cmd = makeApplyCommand(settings);

    const output: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => output.push(msg);

    try {
      await withFakeHome(fakeHome, () => cmd.parse(["--dry-run"]));
    } finally {
      console.log = originalLog;
    }

    assertEquals(output.length, 2);
    assertEquals(output.some((l) => l.includes(".bashrc")), true);
    assertEquals(output.some((l) => l.includes("fish.conf")), true);
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});

Deno.test("makeApplyCommand writes files to home", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(fakeHome, { recursive: true });
    await Deno.mkdir(`${workingDir}/home`, { recursive: true });
    await Deno.writeTextFile(`${workingDir}/home/.bashrc`, "export FOO=bar");

    const settings: Settings = { workingDir, vars: {} };
    const cmd = makeApplyCommand(settings);

    await withFakeHome(fakeHome, () => cmd.parse([]));

    const content = await Deno.readTextFile(`${fakeHome}/.bashrc`);
    assertEquals(content, "export FOO=bar");
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});
