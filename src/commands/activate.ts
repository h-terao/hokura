import { Command } from "@cliffy/command";

const FISH_INIT = `\
function hokura
    if test (count $argv) -gt 0; and test $argv[1] = cd
        set -l dir (command hokura cd)
        if test -n "$dir"
            cd $dir
        end
    else
        command hokura $argv
    end
end`;

const BASH_ZSH_INIT = `\
hokura() {
    if [ "$1" = cd ]; then
        local dir
        dir="$(command hokura cd)"
        if [ -n "$dir" ]; then
            cd "$dir"
        fi
    else
        command hokura "$@"
    fi
}`;

const SHELLS: Record<string, string> = {
  fish: FISH_INIT,
  bash: BASH_ZSH_INIT,
  zsh: BASH_ZSH_INIT,
};

export const makeActivateCommand = () => {
  return new Command()
    .description("Print shell integration script")
    .arguments("<shell:string>")
    .action((_options: void, shell: string) => {
      const script = SHELLS[shell];
      if (!script) {
        throw new Error(
          `Unsupported shell: ${shell}. Supported: ${
            Object.keys(SHELLS).join(", ")
          }`,
        );
      }
      console.log(script);
    });
};
