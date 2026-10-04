# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

@eliware/tagit [![npm](https://img.shields.io/npm/v/@eliware/tagit)](https://www.npmjs.com/package/@eliware/tagit) [![License](https://img.shields.io/github/license/eliware/tagit)](https://github.com/eliware/tagit/blob/main/LICENSE) [![CI](https://github.com/eliware/tagit/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/tagit/actions/workflows/ci.yaml)

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
- [License](#license)
- [Links](#links)

## Features

Deterministic release preflight and publication verification for Eliware packages.
TagIt reports changes, validates repository readiness, pushes already committed
work, creates release tags for DevOps, and verifies CI and registry publication.
It owns its CLI and target-repository validation behavior; target implementation,
CI state, publication state, deployment, and release authorization remain with
their respective owners.

## Requirements

- Node.js 26 or newer
- Git and, for CI inspection, the GitHub CLI (`gh`)
- A target repository with the required files and shared `@eliware/test` harness

## Setup

Install the public npm package with `npm install --global @eliware/tagit`, or
run `npx --yes @eliware/tagit --help`. It provides `tagit`, `push`, and
`upstream` entrypoints. Use Node.js 26 and run commands from the target
repository root. Releases use the explicit `X.Y.Z` version from package
metadata; `release-wait` verifies that exact version after publication. See
[examples](https://github.com/eliware/tagit/tree/main/examples) for the owner workflow.

## Usage

```text
tagit notes
tagit preflight
tagit push
```

Project owners use those commands for handoff. DevOps owns `tagit release` and
`tagit release-wait` after exact-commit preflight passes. The
[owner workflow example](https://github.com/eliware/tagit/blob/main/examples/owner-workflow.md) shows the safe sequence.

## Development

TagIt is an ECMAScript module package targeting Node.js 26. Source is under
`src/`, executable entrypoints are under `bin/`, and mirrored Jest tests are
under `tests/`. Runtime commands are `tagit`, `push`, and `upstream`. TagIt has
no required application-specific environment settings; the optional `LOG_LEVEL`
controls shared logger verbosity. Package metadata and CLI arguments are not
runtime configuration.

Package author: Eliware <eliware@eliware.org>.

## Testing

Run the global `eliware-test` v11 command for aggregate repository validation.
The shared harness owns Jest, lint, formatting, audit, coverage, and package
checks. Run `npm run typecheck` to check JavaScript syntax. Before release
consideration, run `npm outdated` and verify that no direct dependencies are
outdated.

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
files. There is no runtime configuration beyond the optional `LOG_LEVEL`
setting; its default is the shared logger default. The
CLI starts when an entrypoint is invoked and exits when its command completes;
there are no services to start or stop. Never commit `.env` or credentials.
`package.json` metadata and command-line options are not runtime configuration.

## Operations

The CLI starts when invoked and exits after its selected command; shutdown is
automatic because TagIt starts no service. Project owners run `notes`,
`preflight`, and `push`; DevOps owns `release` and `release-wait` after the
exact-commit handoff. These externally observable workflows keep TagIt within
its operational boundary: it does not deploy applications or modify GitOps.
See the [operations guide](docs/operations.md).

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

Supported platforms: Node.js 26 with Git and GitHub CLI when inspecting CI.
Validation evidence: Ubuntu is directly validated in CI. Windows has been exercised for
platform-specific behavior. macOS compatibility is inferred from shared Node.js
and Git behavior and is not directly validated.

## Exit codes

Commands exit with `0` on success and `1` on invalid input, failed validation,
or operational errors. Failure output is bounded and redacts recognized
credential formats. TagIt does not claim a release or publication succeeded
until its required checks pass.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

MIT. See [LICENSE](LICENSE).

## Links

- [Repository](https://github.com/eliware/tagit)
- [GitHub repository](https://github.com/eliware/tagit.git)
- [Home Page](https://github.com/eliware/tagit#readme)
- [Eliware](https://eliware.org)
- [GitHub organization](https://github.com/eliware)
- [Discord](https://discord.gg/M6aTR9eTwN)
- [Documentation](https://github.com/eliware/docs/blob/main/repo-map.yaml)
  Documentation: [docs](docs/README.md) · [specifications](specs/README.md)
- [Behavior specification guides](docs/specifications/README.md)
- [Examples](examples/README.md)
- [Release Notes](RELEASE_NOTES.md)
- [npm Package](https://www.npmjs.com/package/@eliware/tagit)
