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

Use tagit to check release readiness, CI, and applicable npm or GHCR publication.

## Requirements

Use Node.js 26 or later, npm, Git, and GitHub CLI (`gh`). Read [requirements](docs/requirements.md) for target repository requirements.

## Setup

Install tagit with `npm install --global @eliware/tagit` or run `npx --yes @eliware/tagit --help`.

The package provides `tagit`, `push`, and `upstream`. Its public entrypoints are `bin/tagit-cli.mjs`, `bin/push-cli.mjs`, and `bin/upstream-cli.mjs`. The package includes `bin/`, `src/`, `docs/`, `specs/`, `README.md`, `AGENTS.md`, `LICENSE`, and `RELEASE_NOTES.md`. It excludes tests, fixtures, workflow files, lockfiles, and runtime secrets. Read [requirements](docs/requirements.md) for version rules and publication limits.

## Usage

Run commands from the target repository root. Project owners prepare changes and run `notes`, `push`, and `preflight`. DevOps runs `release` and `release-wait` after handoff. Read [operations](docs/operations.md) and [release notes](RELEASE_NOTES.md).

## Development

Read [AGENTS.md](AGENTS.md) for contributor instructions. Read [docs/README.md](docs/README.md) for user guides and [specs/README.md](specs/README.md) for repository rules.

## Testing

Run `npm test` for aggregate validation. CI runs `npm ci` and `npm test` on Ubuntu.

## Troubleshooting

Run `tagit preflight` to find release blockers. Repair each cause, wait for CI on the new commit, and run preflight again.

## Security

Keep credentials, secrets, private data, and runtime state out of Git. Tagit redacts recognized credentials from error output.

## Configuration

Tagit has no configuration file. Set `LOG_LEVEL` to change the shared logger level.

## Operations

Follow the [owner and DevOps handoff](docs/operations.md). Tagit does not deploy applications.

## Commands

Use `notes` to inspect changes, `preflight` to check readiness, and `push` to push commits. Use `release` to create a release tag, `release-wait` to verify a release, and `upstream` to merge the upstream branch. Read the [command guide](docs/commands.md) for syntax and options.

## Exit codes

Commands return `0` when they pass. They return `1` for invalid input, failed checks, or operating errors.

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
