## Implementation Guide

- Use arrow functions for all functions. This is a stylistic choice to maintain
  consistency and modern JavaScript practices.
- Use `zod` to validate user input and configuration. This will help catch
  errors early and provide better error messages to the users.
- Use `cliffy` to create the command-line interface. This will make it easier to
  define commands, options, and arguments, and it provides a nice API for
  handling user input.
- Write unit tests for all public functions.
- All implementations must be formatted and linted with `deno fmt` and
  `deno lint` without any errors or warnings.
