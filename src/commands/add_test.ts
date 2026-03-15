import { assertEquals, assertRejects } from "@std/assert";
import { makeAddCommand } from "@/commands/add.ts";
import type { Settings } from "@/settings.ts";
import { withFakeHome } from "@/test_utils.ts";

Deno.test("makeAddCommand copies file to working dir", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(fakeHome, { recursive: true });
    await Deno.mkdir(workingDir, { recursive: true });

    const srcFile = `${fakeHome}/.bashrc`;
    await Deno.writeTextFile(srcFile, "export PATH=/usr/bin");

    const settings: Settings = { workingDir, vars: {} };
    const cmd = makeAddCommand(settings);

    await withFakeHome(fakeHome, () => cmd.parse([srcFile]));

    const dest = `${workingDir}/home/.bashrc`;
    const content = await Deno.readTextFile(dest);
    assertEquals(content, "export PATH=/usr/bin");
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});

Deno.test("makeAddCommand skips existing file without --force", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(fakeHome, { recursive: true });
    await Deno.mkdir(`${workingDir}/home`, { recursive: true });

    const srcFile = `${fakeHome}/.bashrc`;
    await Deno.writeTextFile(srcFile, "new content");
    await Deno.writeTextFile(`${workingDir}/home/.bashrc`, "old content");

    const settings: Settings = { workingDir, vars: {} };
    const cmd = makeAddCommand(settings);

    await withFakeHome(fakeHome, () => cmd.parse([srcFile]));

    const content = await Deno.readTextFile(`${workingDir}/home/.bashrc`);
    assertEquals(content, "old content");
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});

Deno.test("makeAddCommand copies multiple files", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(fakeHome, { recursive: true });
    await Deno.mkdir(workingDir, { recursive: true });

    await Deno.writeTextFile(`${fakeHome}/.bashrc`, "bashrc content");
    await Deno.writeTextFile(`${fakeHome}/.vimrc`, "vimrc content");

    const settings: Settings = { workingDir, vars: {} };
    const cmd = makeAddCommand(settings);

    await withFakeHome(
      fakeHome,
      () => cmd.parse([`${fakeHome}/.bashrc`, `${fakeHome}/.vimrc`]),
    );

    assertEquals(
      await Deno.readTextFile(`${workingDir}/home/.bashrc`),
      "bashrc content",
    );
    assertEquals(
      await Deno.readTextFile(`${workingDir}/home/.vimrc`),
      "vimrc content",
    );
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});

Deno.test("makeAddCommand overwrites with --force", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(fakeHome, { recursive: true });
    await Deno.mkdir(`${workingDir}/home`, { recursive: true });

    const srcFile = `${fakeHome}/.bashrc`;
    await Deno.writeTextFile(srcFile, "new content");
    await Deno.writeTextFile(`${workingDir}/home/.bashrc`, "old content");

    const settings: Settings = { workingDir, vars: {} };
    const cmd = makeAddCommand(settings);

    await withFakeHome(fakeHome, () => cmd.parse([srcFile, "--force"]));

    const content = await Deno.readTextFile(`${workingDir}/home/.bashrc`);
    assertEquals(content, "new content");
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});

Deno.test("makeAddCommand adds directory recursively", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(`${fakeHome}/.config/app`, { recursive: true });
    await Deno.mkdir(workingDir, { recursive: true });

    await Deno.writeTextFile(`${fakeHome}/.config/app/config.toml`, "key=1");
    await Deno.writeTextFile(`${fakeHome}/.config/app/theme.json`, "{}");

    const settings: Settings = { workingDir, vars: {} };
    const cmd = makeAddCommand(settings);

    await withFakeHome(fakeHome, () => cmd.parse([`${fakeHome}/.config/app`]));

    assertEquals(
      await Deno.readTextFile(`${workingDir}/home/.config/app/config.toml`),
      "key=1",
    );
    assertEquals(
      await Deno.readTextFile(`${workingDir}/home/.config/app/theme.json`),
      "{}",
    );
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});

Deno.test("makeAddCommand errors for nonexistent path", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    const fakeHome = `${tmp}/fakehome`;
    const workingDir = `${tmp}/dotfiles`;
    await Deno.mkdir(fakeHome, { recursive: true });
    await Deno.mkdir(workingDir, { recursive: true });

    const settings: Settings = { workingDir, vars: {} };
    const cmd = makeAddCommand(settings);

    await assertRejects(
      () => withFakeHome(fakeHome, () => cmd.parse([`${fakeHome}/nope`])),
      Error,
      "does not exist or is not a file",
    );
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});
