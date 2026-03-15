import { assertEquals } from "@std/assert";
import { expandHome, isDir, isDirEmpty, isFile } from "@/utils.ts";

Deno.test("expandHome replaces ~ with HOME", () => {
  const original = Deno.env.get("HOME");
  Deno.env.set("HOME", "/test/home");
  try {
    assertEquals(expandHome("~"), "/test/home");
    assertEquals(expandHome("~/foo/bar"), "/test/home/foo/bar");
    assertEquals(expandHome("/absolute/path"), "/absolute/path");
    assertEquals(expandHome("relative/path"), "relative/path");
  } finally {
    if (original) {
      Deno.env.set("HOME", original);
    } else {
      Deno.env.delete("HOME");
    }
  }
});

Deno.test("isDir returns true for directories", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    assertEquals(await isDir(tmp), true);
    assertEquals(await isDir(tmp + "/nonexistent"), false);
  } finally {
    await Deno.remove(tmp);
  }
});

Deno.test("isFile returns true for files", async () => {
  const tmp = await Deno.makeTempFile();
  try {
    assertEquals(await isFile(tmp), true);
    assertEquals(await isFile(tmp + ".nonexistent"), false);
  } finally {
    await Deno.remove(tmp);
  }
});

Deno.test("isDirEmpty returns true for empty dirs", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    assertEquals(await isDirEmpty(tmp), true);
    await Deno.writeTextFile(tmp + "/file.txt", "hello");
    assertEquals(await isDirEmpty(tmp), false);
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});
