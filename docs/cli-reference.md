# CLI reference

Use this guide for command help, version queries, option rules, and exit codes.

## Help and version

Run `tagit --help` or `tagit -h` to show command help. Run `tagit --version` or `tagit -v` to show the installed version. Do not combine help and version options.

## Option rules

Put the command before its options. Use `--dry-run` only with `push`, `release`, or `upstream`.

The `release` command requires `--version X.Y.Z`, which must match `package.json`. The version query accepts no value. `release-wait` always uses the latest semantic release tag.

## Errors and exit codes

Commands return `0` when they pass. They return `1` for invalid input, failed checks, or operating errors.

A bad option, repeated option, unknown argument, or missing required value returns `1`.

## Test coverage

The [option validation tests](../tests/cli/arguments/validate-options.test.mjs) cover command option rules. The [CLI boundary tests](../tests/cli/application/run/cli-boundary.test.mjs) cover error handling and exit behavior.

Read the [error output guide](error-output.md) for credential redaction and output limits.
