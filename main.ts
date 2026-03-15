import { Command } from "@cliffy/command";
import { loadSettings } from "@/settings.ts";
import {
  makeActivateCommand,
  makeAddCommand,
  makeApplyCommand,
  makeCdCommand,
  makeInitCommand,
} from "@/commands/mod.ts";

if (import.meta.main) {
  const settings = await loadSettings();

  const hokura = new Command()
    .name("hokura")
    .description("dotfiles manager")
    .action(function () {
      this.showHelp();
    });

  hokura.command("init", makeInitCommand(settings));
  hokura.command("add", makeAddCommand(settings));
  hokura.command("cd", makeCdCommand(settings));
  hokura.command("activate", makeActivateCommand());
  hokura.command("apply", makeApplyCommand(settings));

  try {
    await hokura.parse(Deno.args);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${msg}`);
    Deno.exit(1);
  }
}
