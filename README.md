# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/tagit [![npm](https://img.shields.io/npm/v/@eliware/tagit)](https://www.npmjs.com/package/@eliware/tagit) [![License](https://img.shields.io/github/license/eliware/tagit)](https://github.com/eliware/tagit/blob/main/LICENSE) [![CI](https://github.com/eliware/tagit/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/tagit/actions/workflows/ci.yaml)

Deterministic release preflight and publication verification for Eliware packages.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Configuration](#configuration)
- [Operations](#operations)
- [Commands](#commands)
- [Exit codes](#exit-codes)
- [Support](#support)
- [Links](#links)
- [License](#license)

## Features

Use `tagit` to check release readiness and CI. The command checks npm or GHCR publication when a matching profile and workflow exist.

## Requirements

Use Node.js 26 or later. Install Git and GitHub CLI (`gh`). Target repositories require `@eliware/test` as a dev dependency and must set `scripts.test` to `eliware-test`. The `@eliware/test` repository uses `node bin/eliware-test.mjs` and does not require itself as a dev dependency.

## Setup

Install tagit with `npm install --global @eliware/tagit`. Or run `npx --yes @eliware/tagit --help`.

The package provides `tagit`, `push`, and `upstream`. Its public entrypoints are `bin/tagit-cli.mjs`, `bin/push-cli.mjs`, and `bin/upstream-cli.mjs`. The package includes `bin/`, `src/`, `docs/`, `specs/`, `README.md`, `AGENTS.md`, `LICENSE`, and `RELEASE_NOTES.md`. It excludes tests, fixtures, workflow files, lockfiles, and runtime secrets. Use a supported release version. Do not depend on internal source modules.

## Usage

Run each command from the target repository root. Project owners run `notes`, `preflight`, and `push`. DevOps runs `release` and `release-wait` after handoff. Read the [operations guide](docs/operations.md) and [command guide](docs/commands.md). See [release notes](RELEASE_NOTES.md) for version changes.

## Development

Read the [documentation index](docs/README.md) for user guides. Read the [specification index](specs/README.md) for repository rules.

## Testing

Run `npm test` for aggregate validation. CI runs `npm ci` and `npm test` on Ubuntu.

## Troubleshooting

Run `tagit preflight` to find release blockers. Repair each reported cause. Confirm CI passed for the exact commit. Run preflight again.

## Security

Keep credentials and `.env` files out of Git. The `tagit` command redacts recognized secrets from error output. It does not verify operator roles.

## Configuration

The `tagit` command has no required configuration files. Set `LOG_LEVEL` to change the shared logger level. Each command starts, completes its checks or actions, and exits. The command does not start a process that stays active.

## Operations

Follow the [owner and DevOps handoff](docs/operations.md). The `tagit` command does not deploy applications or edit GitOps repositories.

## Commands

- `tagit notes` reports changes since the latest Git tag. It accepts no arguments.
- `tagit preflight [--ignore-100x4] [--ignore-monolith-limits]` checks local gates and CI for the current commit. It requires a clean `main` branch. Ubuntu CI must pass. Each Windows job must pass when one exists.
- `tagit push [--dry-run]` pushes existing commits from the current branch. It does not stage files or create commits. Dry run skips the push and CI lookup.
- `tagit release --version X.Y.Z [--dry-run] [--ignore-100x4] [--ignore-monolith-limits]` runs preflight, creates an empty release commit, pushes its tag and `main` atomically, and reports workflow links.
- `tagit release-wait` checks CI for the latest release tag. It checks publication only when `npm.yaml` or `ghcr.yaml` and a matching profile exist. Do not pass `--version`.
- `push [--dry-run]` runs the same action as `tagit push`.
- `upstream [--dry-run] [merge-message...]` merges and pushes the configured upstream branch. It uses `upstream/HEAD`, or `upstream/main` when no default exists. The default message uses the current UTC time.
- `tagit --help` or `tagit -h` shows help. `tagit --version` or `tagit -v` shows the installed version.
- Use `--dry-run` only with `push`, `release`, or `upstream`. It skips release actions where applicable.
- Commands return `0` on success and `1` for invalid input, failed checks, or operating errors.
- DevOps can use `--ignore-100x4` or `--ignore-monolith-limits` only with an approved waiver.

Read the [full command guide](docs/commands.md) for options, defaults, errors, and examples.

## Exit codes

Commands return `0` on success. They return `1` for invalid input, failed checks, or operational errors.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/tagit)
- [Bug Reports](https://github.com/eliware/tagit/issues)
- [npm](https://www.npmjs.com/package/@eliware/tagit)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

[MIT © Eliware](LICENSE)
