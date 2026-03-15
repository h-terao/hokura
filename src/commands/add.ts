import { dirname, resolve } from "@std/path";
import { walk } from "@std/fs";
import { Command } from "@cliffy/command";
import type { Settings } from "@/settings.ts";
import { expandHome, isDir, isFile } from "@/utils.ts";

const copyFile = async (
  src: string,
  home: string,
  workingDir: string,
  options: { verbose?: boolean; force?: boolean },
) => {
  if (!src.startsWith(home + "/") && src !== home) {
    throw new Error(`${src} is outside the home directory.`);
  }

  const relative = src.slice(home.length + 1);
  const dest = `${workingDir}/home/${relative}`;

  if (await isFile(dest)) {
    if (!options.force) {
      if (options.verbose) {
        console.log(`Already added: ${relative}`);
      }
      return;
    }
  }

  await Deno.mkdir(dirname(dest), { recursive: true });
  await Deno.copyFile(src, dest);

  if (options.verbose) {
    console.log(`Added: ${src} -> ${dest}`);
  }
};

export const addFile = async (
  settings: Settings,
  options: { verbose?: boolean; force?: boolean },
  file: string,
) => {
  const home = Deno.env.get("HOME");
  if (!home) {
    throw new Error("HOME environment variable is not set.");
  }

  const src = resolve(expandHome(file));
  const workingDir = expandHome(settings.workingDir);

  if (await isDir(src)) {
    for await (
      const entry of walk(src, { includeFiles: true, includeDirs: false })
    ) {
      await copyFile(entry.path, home, workingDir, options);
    }
    return;
  }

  if (!(await isFile(src))) {
    throw new Error(`${src} does not exist or is not a file.`);
  }

  await copyFile(src, home, workingDir, options);
};

export const makeAddCommand = (settings: Settings) => {
  return new Command()
    .description("Add files or directories to the dotfiles repository")
    .arguments("<files...:string>")
    .option("-v, --verbose", "Print source and destination paths")
    .option("-f, --force", "Overwrite existing file in repository")
    .action(
      async (
        options: { verbose?: boolean; force?: boolean },
        ...files: string[]
      ) => {
        for (const file of files) {
          await addFile(settings, options, file);
        }
      },
    );
};
