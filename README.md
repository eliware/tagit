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

TagIt reports changes, checks repository readiness, pushes existing commits, creates release tags for DevOps, and verifies CI and package publication. It owns its CLI and target repository checks. Project owners retain control of target code, CI state, publication, deployment, and release approval.

## Requirements

Use Node.js 26 or later. Install Git. Install GitHub CLI (`gh`) for CI checks. Use a target repository with the shared `@eliware/test` harness.

## Setup

Install TagIt with `npm install --global @eliware/tagit`. Or run `npx --yes @eliware/tagit --help`. Use Node.js 26 or later. Run each command from the target repository root. The release version comes from `package.json`. `release-wait` checks that exact version after publication.

## Usage

Run `tagit notes`, `tagit preflight`, and `tagit push` as the project owner. DevOps runs `tagit release --version X.Y.Z` and `tagit release-wait` after preflight passes. See the [owner workflow example](https://github.com/eliware/tagit/blob/main/examples/owner-workflow.md). See [Release Notes](RELEASE_NOTES.md) for version changes.

## Development

TagIt uses native ESM modules. Source modules live in `src/`. Command entrypoints live in `bin/`. Mirrored Jest tests live in `tests/`. The `tagit`, `push`, and `upstream` commands have separate entrypoints. The optional `LOG_LEVEL` setting adjusts shared logger output. Package data and command options are not runtime settings.

Read [AGENTS.md](AGENTS.md), the [documentation index](docs/README.md), the [specification index](specs/README.md), and [release notes](RELEASE_NOTES.md) before you change the project. See the [examples index](examples/README.md) for the owner workflow.

## Testing

Run `npm test` for aggregate v12 validation. It runs Jest, lint, formatting, audit, coverage, and package checks. Run `npm run typecheck` for a focused syntax check. Run `npm run format:check` for a read-only formatting check. CI runs `npm ci` and `npm test` on Ubuntu.

## Troubleshooting

`tagit preflight` blocks on a dirty worktree, missing metadata, invalid workflow policy, or missing or stale CI evidence. Review each reported issue. Fix the cause. Run preflight again for the exact commit.

## Security

TagIt does not collect credentials or verify operator roles. Keep tokens out of source and environment examples. Use GitHub CLI and npm credential handling. Release actions require the approved release flow. `--dry-run` checks readiness without release actions.

## Configuration

TagIt has no required application settings or configuration files. The optional `LOG_LEVEL` setting uses the shared logger default. A command starts when you call an entrypoint and ends after it runs. TagIt starts no service. Never commit `.env` files or credentials. Package data and CLI options are not runtime settings.

## Operations

The CLI starts when called and exits after the command. Project owners run `notes`, `preflight`, and `push`. DevOps runs `release` and `release-wait` after the exact commit handoff. TagIt does not deploy applications or change GitOps data. See the [operations guide](docs/operations.md).

## Commands

- `tagit notes` reports changes since the latest tag. It does not change files.
- `tagit preflight` checks local gates and exact-HEAD Ubuntu CI. Windows jobs must also pass when present.
- `tagit push` pushes existing commits. It does not stage or commit files.
- `tagit release --version X.Y.Z` runs the DevOps release flow for one version.
- `tagit release-wait` checks CI and publication after release.
- `tagit --help` and `tagit --version` show help and the installed version.
- `--dry-run` checks readiness without release actions.
- `--ignore-100x4` and `--ignore-monolith-limits` are DevOps-only test waivers.
- The `push` executable accepts the options for `tagit push`.
- `upstream [--dry-run] [merge-message...]` fetches, merges, and pushes the configured upstream branch. It uses the current UTC time as the default merge message. Dry run reports the planned branch and message. It does not fetch, merge, or push.

All commands run from the target repository root. TagIt supports Node.js 26 or later with Git. CI checks also need GitHub CLI. CI directly validates Ubuntu. Tests cover Windows-specific behavior. macOS support is inferred from shared Node.js and Git behavior. macOS is not directly validated. Release operations create and push only the requested release tag. TagIt does not rewrite files or stage unrelated changes.

## Exit codes

Commands return `0` on success. They return `1` on invalid input, failed validation, or operational errors. Failure output is limited and redacts recognized credentials. TagIt reports release or publication success only after required checks pass.

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
