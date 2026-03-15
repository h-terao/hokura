import { Command } from "@cliffy/command";
import type { Settings } from "@/settings.ts";
import { expandHome, isDir, isDirEmpty } from "@/utils.ts";

export const makeInitCommand = (settings: Settings) => {
  return new Command()
    .description("Initialize a new dotfiles repository")
    .arguments("[repo:string]")
    .option("-f, --force", "Initialize even if directory is not empty")
    .action(async (options: { force?: boolean }, repo?: string) => {
      const dir = expandHome(settings.workingDir);

      if (await isDir(dir) && !(await isDirEmpty(dir)) && !options.force) {
        throw new Error(
          `${dir} is not empty. Use --force to initialize anyway.`,
        );
      }

      if (repo) {
        const cmd = new Deno.Command("git", {
          args: ["clone", repo, dir],
          stdin: "inherit",
          stdout: "inherit",
          stderr: "inherit",
        });
        const result = await cmd.output();
        if (!result.success) {
          throw new Error("git clone failed.");
        }
      } else {
        await Deno.mkdir(dir, { recursive: true });
        const cmd = new Deno.Command("git", {
          args: ["init"],
          cwd: dir,
          stdin: "inherit",
          stdout: "inherit",
          stderr: "inherit",
        });
        const result = await cmd.output();
        if (!result.success) {
          throw new Error("git init failed.");
        }
      }
    });
};
