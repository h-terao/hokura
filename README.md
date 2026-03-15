# Hokura

A dotfiles manager written in Deno🦕

## Installation

You can install Hokura either with Deno or by using the standalone binary. The
standalone binary includes all required dependencies, so you do not need to
install Deno to use Hokura.

**With Deno**

```bash
$ deno install --global --allow-read --allow-write --allow-env --allow-run \
  --name hokura \
  https://raw.githubusercontent.com/h-terao/hokura/main/main.ts
```

**Standalone binary**

```bash
$ curl -fsSL https://raw.githubusercontent.com/h-terao/hokura/main/install.sh | sh
```

### Enable shell integration

Some Hokura features require shell integration. To enable it, run one of the
following commands in your shell:

- Bash: `eval "$(hokura activate bash)"`
- Zsh: `eval "$(hokura activate zsh)"`
- Fish: `hokura activate fish | source`

## Features

- A chezmoi-like workflow for managing dotfiles
  - Hokura copies your dotfiles into a separate working directory. Changes are
    not applied automatically; you must explicitly run `hokura apply`.
- A minimal feature set for managing dotfiles without unnecessary complexity
- All tracked dotfiles are treated as templates by default, so you can embed
  environment-specific values and logic

## Getting Started

### Initialize a working directory

After installing Hokura, you can initialize a new repository to manage your
dotfiles by running:

```bash
$ hokura init
```

To clone an existing repository instead, run:

```bash
$ hokura init git@github.com:<username>/<repository>.git
```

### Track your dotfiles

To track your dotfiles, run:

```bash
$ hokura add <path-to-dotfile>
```

For example, to track `~/.bashrc`, run `hokura add ~/.bashrc`.

### Apply changes

If you modify dotfiles in the working directory, you need to explicitly apply
those changes to your home directory by running:

```bash
$ hokura apply
```

If the `--dry-run` option is specified, Hokura shows what would be changed
without actually applying the changes.

### Git integration

Unlike some other dotfiles managers, Hokura does not provide Git-compatible
commands.

Instead, Hokura provides `hokura cd` to quickly jump to the working directory.
You can also access it directly at `~/.local/share/hokura` (or the path
specified in the configuration file).

Because the working directory itself is a Git repository, you can use standard
Git commands to manage your dotfiles.

## Working directory structure

The working directory has the following structure:

```
~/.local/share/hokura/
  .git/
  home/                 # Tracked dotfiles
    .bashrc
    ...
```

You can place any files you like outside the `home` directory for your own
purposes. For example, you might add a `README.md` or `LICENSE` file to document
your repository. Hokura ignores those files when applying changes.

## Settings

Hokura looks for its configuration file at `~/.config/hokura/settings.toml`.
Here is an example:

```toml
workingDir = "~/.local/share/hokura"

[vars]
name = "alice"
email = "alice@example.com"
```

## Templating

Hokura treats all tracked dotfiles as templates. This allows you to use
environment-specific values and logic in your dotfiles. When you run
`hokura apply`, Hokura renders the templates and writes the rendered files to
your home directory.

### Available variables

**Built-in variables**

Hokura automatically provides several built-in variables in templates:

- `home`: The path to the home directory of current user.
- `os`: Operating system name. It can be `windows`, `darwin`, or `linux`.

**Environment variables**

All environment variables are available under the `env` namespace. For example,
`{{ env.EDITOR }}` is replaced with the value of the `EDITOR` environment
variable.

**User-defined variables**

You can also define your own variables in the configuration file. These
variables are available without a prefix. For example, given the following
configuration:

```toml
[vars]
name = "alice"
```

You can use `{{ name }}` in your dotfiles, and it will be replaced with `alice`.

The variable priority is: environment variables > user-defined variables >
built-in variables. For example, if you define `home` in the configuration file,
it overrides the built-in `home` variable. Environment variables always take
precedence — if the `EDITOR` environment variable is set, it cannot be
overridden by `vars.env.EDITOR` in the configuration file.
