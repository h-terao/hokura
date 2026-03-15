# Hokura

A template-native dotfiles manager written in [Deno](https://deno.com/) 🦕

## Features

**Template-native**

All tracked files are rendered with [Vento](https://vento.js.org/) before being
applied. Plain files also work as-is, so you can start simple and introduce
templating only when needed.

**Minimal**

Hokura keeps its feature set intentionally small. Secrets are expected to come
from environment variables, so it works naturally with tools like
[1Password](https://1password.com/), [Bitwarden](https://bitwarden.com/), and
[dotenvx](https://dotenvx.com/). Git integration is also minimal, so you can use
Git, [Jujutsu](https://www.jj-vcs.dev/latest/), or any other workflow you
prefer.

**Explicit workflow**

Hokura copies files into a working directory first, and changes are applied to
your system only when you run `hokura apply`. This makes it easy to understand
when changes actually take effect.

**Simple commands, flexible templating**

The CLI stays small and easy to learn, while advanced customization is handled
in templates through [Vento](https://vento.js.org/).

## Installation

Install Hokura with the standalone binary:

```bash
$ curl -fsSL https://raw.githubusercontent.com/h-terao/hokura/main/install.sh | sh
```

Or, if you prefer Deno:

```bash
$ deno install --global --allow-read --allow-write --allow-env --allow-run \
  --name hokura \
  https://raw.githubusercontent.com/h-terao/hokura/main/main.ts
```

### Shell integration

Some features require shell integration. To enable it, add the appropriate
command to your shell configuration file:

```bash
# Bash
echo 'eval "$(hokura activate bash)"' >> ~/.bashrc

# Zsh
echo 'eval "$(hokura activate zsh)"' >> ~/.zshrc

# Fish
echo 'hokura activate fish | source' >> ~/.config/fish/config.fish
```
