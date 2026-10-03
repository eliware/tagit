# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/tagit [![npm version](https://img.shields.io/npm/v/@eliware/tagit.svg)](https://www.npmjs.com/package/@eliware/tagit) [![license](https://img.shields.io/github/license/eliware/tagit.svg)](LICENSE) [![CI](https://github.com/eliware/tagit/actions/workflows/ci.yml/badge.svg)](https://github.com/eliware/tagit/actions/workflows/ci.yml)

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
- [npm publication](#npm-publication)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Features

Deterministic release preflight and publication verification for Eliware packages.
TagIt reports changes, validates repository readiness, pushes already committed
work, creates release tags for DevOps, and verifies CI and registry publication.

## Requirements

- Node.js 26 or newer
- Git and, for CI inspection, the GitHub CLI (`gh`)
- A target repository with the required files and shared `@eliware/test` harness

## Setup

Install globally with `npm install --global @eliware/tagit`, or run
`npx --yes @eliware/tagit --help`. Use Node.js 26 or newer and run commands from
the target repository root. See [examples](examples/README.md) for the owner
workflow.

## Usage

```text
tagit notes
tagit preflight
tagit push
```

Project owners use those commands for handoff. DevOps owns `tagit release` and
`tagit release-wait` after exact-commit preflight passes. The
[owner workflow example](examples/owner-workflow.md) shows the safe sequence.

## Development

TagIt is an ECMAScript module package targeting Node.js 26. Source is under
`src/`, executable entrypoints are under `bin/`, and mirrored Jest tests are
under `tests/`. Runtime commands are `tagit`, `push`, and `upstream`. TagIt has
no required application-specific environment settings; the optional `LOG_LEVEL`
controls shared logger verbosity. Package metadata and CLI arguments are not
runtime configuration.

The package description is “Deterministic release preflight and publication
verification for Eliware packages.” The package author is Eliware
`<eliware@eliware.org>`.

## Testing

Run `npm test` for aggregate repository validation. The shared harness owns Jest,
lint, formatting, audit, coverage, and package checks. Run `npm run typecheck` to
check JavaScript syntax. Before release consideration, run `npm outdated` and
verify that no direct dependencies are outdated.

## Troubleshooting

`tagit preflight` blocks on a dirty worktree, missing metadata or required files,
invalid workflow policy, or missing, stale, failed, or mismatched CI evidence.
Review the reported remediation and rerun preflight for the exact commit being
handed off.

## Security

TagIt does not collect credentials or authenticate operator roles. Keep tokens
out of source and environment templates; use GitHub CLI and npm's normal
credential handling. Destructive release actions require an explicit authorized
release flow. `--dry-run` checks readiness without release side effects.

## Configuration

There are no required application-specific environment variables or config
files. The optional `LOG_LEVEL` setting controls shared logger verbosity. The
`.env.example` file documents the supported local template; never commit `.env`
or credentials. `package.json` metadata and command-line options are not runtime
configuration.

## Operations

Project owners run `notes`, `preflight`, and `push`; DevOps owns `release` and
`release-wait` after the exact-commit handoff. TagIt does not deploy applications
or modify GitOps. See the [operations guide](docs/operations.md).

## Commands

- `tagit notes`: report changes since the latest tag; read-only.
- `tagit preflight`: verify local gates and exact-HEAD Ubuntu CI; Windows is
  optional, but present Windows jobs must pass.
- `tagit push`: push existing commits only; it does not stage or commit files.
- `tagit release --version X.Y.Z`: DevOps release flow for an explicit version.
- `tagit release-wait`: verify CI and publication after release.
- `tagit --help` and `tagit --version`: show help and installed version.
- `--dry-run`: check readiness without release side effects.
- `--ignore-100x4` and `--ignore-monolith-limits`: documented DevOps-only test
  waivers forwarded to the shared harness.
- The `push` executable accepts the same options as `tagit push`.
- `upstream [--dry-run] [merge-message...]` fetches the configured upstream
  default branch, merges it, then pushes. Without a message it uses the current
  UTC timestamp. `--dry-run` reports the planned branch/message without
  fetching, merging, or pushing; `--help` and `--version` show usage/version.

All commands run from the target repository root. TagIt supports Node.js 26+
where Git and, for CI inspection, GitHub CLI are available. Release operations
are deliberately limited to release tags; TagIt does not rewrite files or stage
unrelated changes.

## Exit codes

Commands exit with `0` on success and `1` on invalid input, failed validation,
or operational errors. Failure output is bounded and redacts recognized
credential formats. TagIt does not claim a release or publication succeeded
until its required checks pass.

## npm publication

Package identity and version come from `package.json`; published contents are
restricted to the `files` allowlist. The package requires Node.js 26+, uses npm
provenance, and validates packaging with `npm run pack` before publication.
`tagit release-wait` verifies that the exact version is visible in the public
npm registry. Publication remains a DevOps action requiring explicit
authorization through the applicable Operations handoff; this documentation is
not authorization to publish.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

MIT. See [LICENSE](LICENSE).

## Links

- [Repository](https://github.com/eliware/tagit)
- [End-user documentation](docs/README.md)
- [Specifications and authority status](specs/README.md)
- [Behavior specification guides](docs/specifications/README.md)
- [Examples](examples/README.md)
- [Release notes](RELEASE_NOTES.md)
- [npm package](https://www.npmjs.com/package/@eliware/tagit)
