import { Command } from "@cliffy/command";
import type { Settings } from "@/settings.ts";
import { expandHome } from "@/utils.ts";

/** Build cd command instance. */
export const makeCdCommand = (settings: Settings): Command => {
  return new Command()
    .description("Change to the hokura working directory")
    .action(async () => {
      const dir = expandHome(settings.workingDir);
      await Deno.mkdir(dir, { recursive: true });
      console.log(dir);
    });
};
