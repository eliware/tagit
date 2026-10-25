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

Check release readiness, CI, and applicable npm or GHCR publication.

## Requirements

Use Node.js 26 or later, npm, Git, and GitHub CLI (`gh`). Read [target requirements](docs/requirements.md).

## Setup

Install tagit with `npm install --global @eliware/tagit` or run `npx --yes @eliware/tagit`.

The package provides `tagit`, `push`, and `upstream` commands. Its entrypoints are `bin/tagit-cli.mjs`, `bin/push-cli.mjs`, and `bin/upstream-cli.mjs`.

The package includes `bin/`, `src/`, `docs/`, `specs/`, `README.md`, `AGENTS.md`, `LICENSE`, and `RELEASE_NOTES.md`. It excludes tests, fixtures, workflows, lockfiles, and runtime secrets. Read [target requirements](docs/requirements.md) for version rules and publication limits.

## Usage

Run commands from the target repository root. Project owners run `notes`, `push`, and `preflight`. DevOps runs `release` and `release-wait` after handoff. Read the [operations guide](docs/operations.md) and [release notes](RELEASE_NOTES.md).

## Development

Read [AGENTS.md](AGENTS.md), the [user guide index](docs/README.md), and the [specifications index](specs/README.md).

## Testing

Run `npm test` for aggregate validation.

## Troubleshooting

Read the [troubleshooting guide](docs/troubleshooting.md).

## Security

Keep credentials, secrets, private data, and runtime state out of Git. Tagit redacts recognized credentials from error output.

## Configuration

Tagit does not require a configuration file.

## Operations

Follow the [owner and DevOps handoff](docs/operations.md). Tagit does not deploy applications.

## Commands

Use `notes` to inspect changes, `preflight` to check readiness, and `push` to push commits. Use `release` and `release-wait` for a release. Use `upstream` to merge the upstream branch. Read the [command guide](docs/commands.md) for syntax and options.

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
