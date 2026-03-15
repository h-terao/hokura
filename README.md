# Hokura

Dotfiles manager written in Deno🦕

## Features

- [chezmoi](https://chezmoi.io/)-like flow for managing dotfiles
  - Hokura copies your dotfiles to a separate directory. To apply changes,
    explicitly run `hokura apply` command.
- Just enough features to manage dotfiles without unnecessary complexity
- All dotfiles are templates, allowing you to insert environment-specific values
  in default

### Activate hokura

Some features of hokura require shell integration. To enable the shell
integration, run one of the following commands in your shell:

- Bash: `eval "$(hokura activate bash)"`
- Zsh: `eval "$(hokura activate zsh)"`
- Fish: `hokura activate fish | source`

## Getting Started

### Initialize a working directory

After installing hokura, you can initialize a new repository to manage your
dotfiles. To initialize a new repository, run the following command:

```bash
$ hokura init
```

Instead, run the following command to clone an existing repository:

```bash
$ hokura init git@github.com:<username>/<repository>.git
```

### Track your dotfiles

To track your dotfiles, run the following command:

```bash
$ hokura add <path-to-dotfile>
```

For example, if you want to track `~/.bashrc`, run `hokura add ~/.bashrc`.

### Apply changes

If you change your dotfiles in the working directory, you need to explicitly
apply the changes to your home directory. To apply the changes, run the
following command:

```bash
$ hokura apply
```

If `--dry-run` option is specified, hokura will show the changes that would be
applied without actually applying them.

### Git integration

Unlike other dotfiles managers, hokura does not provide any git-compatible
commands.

Hokura provides a `hokura cd` command to quickly access the working directory.
You can also directly access the working directory at `~/.local/share/hokura`
(or the path specified in the configuration file).

The working directory is a git repository, so you can use any git commands to
manage your dotfiles.

## Working directory structure

The working directory has the following structure:

```
~/.local/share/hokura/
  .git/
  home/                 # Tracked dotfiles
    .bashrc
    ...
```

You can add any files outside the `home` directory for your own purposes. For
example, you can add `README.md` or `LICENSE` for documenting your repository.
Hokura just ignores them when applying changes.

## Settings

Hokura looks for a configuration file at `~/.config/hokura/settings.toml`. Below
is an example configuration file:

```toml
workingDir = "~/.local/share/hokura"

[vars]
name = "alice"
email = "alice@example.com"
```

## Templating

Hokura considers all tracked dotfiles as templates. It means that you can use
environment-specific values or logics in your dotfiles. When you run
`hokura apply`, hokura will render the templates and apply the rendered files to
your home directory.

### Available variables

**Built-in variables**

Hokura automatically adds some built-in variables to the templates. Below is the
list of built-in variables:

- `home`: The path to the home directory of current user.
- `os`: Operating system name. It can be `windows`, `darwin`, or `linux`.

**Environment variables**

All environment variables are available with `env` prefix. For example,
`{{ env.EDITOR }}` will be replaced with the value of `EDITOR` environment
variable.

**User variables**

You can also define your own variables in the configuration file. The variables
would be available with no prefix. For example, if you define following
configuration:

```toml
[vars]
name = "alice"
```

, then you can use `{{ name }}` in your dotfiles, and it will be replaced with
`alice`. Also, user variables override builtin variables and environment
variables. So if you define `EDITOR` variable in the configuration file, it will
override the `EDITOR` environment variable.
