import { assertEquals, assertStringIncludes } from "@std/assert";
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

Deno.test("makeApplyCommand merges user env vars with system env vars", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(fakeHome, { recursive: true });
    await Deno.mkdir(`${workingDir}/home`, { recursive: true });
    await Deno.writeTextFile(
      `${workingDir}/home/.bashrc`,
      "home={{ env.HOME }} custom={{ env.HOKURA_TEST_VAR }}",
    );

    const settings: Settings = {
      workingDir,
      vars: { env: { HOKURA_TEST_VAR: "from_vars" } },
    };
    const cmd = makeApplyCommand(settings);

    await withFakeHome(fakeHome, () => cmd.parse([]));

    const content = await Deno.readTextFile(`${fakeHome}/.bashrc`);
    // env.HOME comes from system env (env > user)
    assertStringIncludes(content, `home=${fakeHome}`);
    // env.HOKURA_TEST_VAR comes from user vars (no system env set)
    assertStringIncludes(content, "custom=from_vars");
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});

Deno.test("makeApplyCommand env vars take precedence over user vars", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(fakeHome, { recursive: true });
    await Deno.mkdir(`${workingDir}/home`, { recursive: true });
    await Deno.writeTextFile(
      `${workingDir}/home/.bashrc`,
      "val={{ env.HOKURA_TEST_PRIO }}",
    );

    Deno.env.set("HOKURA_TEST_PRIO", "from_env");
    const settings: Settings = {
      workingDir,
      vars: { env: { HOKURA_TEST_PRIO: "from_vars" } },
    };
    const cmd = makeApplyCommand(settings);

    try {
      await withFakeHome(fakeHome, () => cmd.parse([]));
    } finally {
      Deno.env.delete("HOKURA_TEST_PRIO");
    }

    const content = await Deno.readTextFile(`${fakeHome}/.bashrc`);
    // System env var wins over user-defined vars.env
    assertStringIncludes(content, "val=from_env");
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});
