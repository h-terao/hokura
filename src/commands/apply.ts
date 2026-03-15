import { dirname, join, relative } from "@std/path";
import { Command } from "@cliffy/command";
import type { Settings } from "@/settings.ts";
import { expandHome, isDir } from "@/utils.ts";
import vento from "ventojs";

const env = vento();

const walkFiles = async function* (dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = join(dir, entry.name);
    if (entry.isDirectory) {
      yield* walkFiles(path);
    } else if (entry.isFile) {
      yield path;
    }
  }
};

export const makeApplyCommand = (settings: Settings) => {
  return new Command()
    .description("Apply dotfiles to the system")
    .option("--dry-run", "Show what would be done without making changes")
    .action(async (options: { dryRun?: boolean }) => {
      const home = Deno.env.get("HOME");
      if (!home) {
        throw new Error("HOME environment variable is not set.");
      }

      const workingDir = expandHome(settings.workingDir);
      const homeDir = join(workingDir, "home");

      if (!(await isDir(homeDir))) {
        throw new Error(`${homeDir} does not exist.`);
      }

      const data: Record<string, unknown> = {
        home,
        os: Deno.build.os,
        env: Deno.env.toObject(),
        ...settings.vars,
      };

      for await (const filePath of walkFiles(homeDir)) {
        const rel = relative(homeDir, filePath);
        const dest = join(home, rel);

        if (options.dryRun) {
          console.log(`Would write: ${dest}`);
          continue;
        }

        const source = await Deno.readTextFile(filePath);
        let content: string;
        try {
          ({ content } = await env.runString(source, data));
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          throw new Error(`Error rendering ${rel}: ${msg}`);
        }
        await Deno.mkdir(dirname(dest), { recursive: true });
        await Deno.writeTextFile(dest, content);
        console.log(`Written: ${dest}`);
      }
    });
};
