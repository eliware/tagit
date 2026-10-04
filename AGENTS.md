# AGENTS.md

## Project

Repository: `eliware/tagit`. Purpose: provide the `@eliware/tagit` Node.js CLI for release preflight, owner handoff, and post-release verification. Repository-wide development instructions apply throughout this repository; subdirectory AGENTS.md instructions apply only within their subdirectories. Before changing files, read the root README.md, applicable AGENTS.md instructions, applicable documentation, and applicable specifications.

## Scope and boundaries

Repository-wide scope: TagIt owns its CLI and target repository validation behavior. It does not own target-project implementation, CI state, publication state, deployment, GitOps desired state, or release authorization. Shared requirements are authoritative in the Docs, Test, and Operations repositories. Project-specific deviation does not waive convention IDs or validation stages. Instructions must be actionable, current, and concise.

## Layout

- `bin/`: executable package entrypoints.
- `src/`: native ESM implementation.
- `tests/`: mirrored Jest tests.
- `docs/`: user documentation and operational boundaries.
- `specs/`: indexed structured directives.
- `.github/workflows/ci.yaml`: validation; `publish.yaml`: npm Trusted Publishing.

## Development

Use Node.js 26, npm, and native ESM. Keep each module to one cohesive purpose and one reason to change. Business-logic modules and coordinators, including coordinators of coordinators, are valid when each has one distinct responsibility. Put every distinct new responsibility in a focused submodule with a mirrored test and wire it through its owner; do not add the new responsibility to an existing module. Refactor mixed responsibilities found during ordinary review. Passing them does not prove cohesion or single responsibility, and does not permit mixed responsibilities below an applicable maximum; refactor them when found.

Repository-wide development instructions apply to every source and test subdirectory; nearer AGENTS.md files apply only in their subdirectories. Before changing files, read README.md, applicable AGENTS.md instructions, applicable documentation, and applicable specifications. Runtime commands are `tagit`, `push`, and `upstream`. There are no required application-specific environment settings; optional `LOG_LEVEL` adjusts shared logger verbosity.

## Validation

Use the global `eliware-test` v11 command for aggregate validation; it owns Jest, lint, formatting, audit, coverage, and package validation. Also run `npm run typecheck` and `git diff --check`. CI runs `npm ci`, then `npm test`, then the repository-specific typecheck on Ubuntu. Before release consideration, run `npm outdated` and verify no direct dependency is outdated. Knit configuration is in `.knit/deploy.yaml`.

## Security

Never commit secrets, credentials, `.env`, generated sessions, or machine state. Use approved CLI credential stores. Keep validation read-only except documented local test outputs. Do not weaken shared security requirements or treat project instructions as waivers.

## Changes

Add focused regression tests and update user documentation and release notes for behavior changes. Record only approved deviations. Do not commit, tag, push, release, or publish without explicit authorization for the current task. Release and publication require the applicable DevOps handoff.

## Application

The application runtime starts at `bin/tagit-cli.mjs`, with `push` and `upstream` executable entrypoints. TagIt has no service lifecycle to start or stop and opens no application network connections. This is the operational boundary. It has no required runtime configuration; `LOG_LEVEL` is optional. Validate externally observable CLI workflows with the aggregate harness and review the documented workflow inventory; passing tests alone does not prove every workflow is documented or covered.

## CLI

Entrypoints are `bin/tagit-cli.mjs` (`tagit`), `bin/push-cli.mjs` (`push`, a wrapper for `tagit push`), and `bin/upstream-cli.mjs` (`upstream`). Commands are `notes`, `preflight`, `push`, `release --version X.Y.Z`, and `release-wait`. Options include `--help`, `--version`, `--dry-run`, `--ignore-100x4`, and `--ignore-monolith-limits`; the parser rejects unsupported options, positional arguments, and invalid combinations. Test waivers reach only supported preflight/release commands. `upstream` accepts optional merge-message text (default UTC timestamp) and `--dry-run`; dry run reports the selected branch without fetching, merging, or pushing. All entrypoints provide help and version. Success exit code is 0; invalid input, validation failures, and operational errors map to exit code 1. Requirements are Node.js 26, Git, and GitHub CLI for CI inspection. Ubuntu is directly validated in CI. Windows has been exercised for platform-specific behavior; macOS compatibility is inferred from shared Node.js and Git behavior, not directly validated. State supported platforms separately from validation evidence. `push` pushes existing commits only; release operations create and push only the requested release tag. Dry run checks readiness without release side effects.

## npm publication

The public package is `@eliware/tagit`; `package.json` is the version source. The exact files allowlist is `bin/`, `src/`, `docs/`, `README.md`, `AGENTS.md`, `LICENSE`, and `RELEASE_NOTES.md`. Pack validation command: `npm run pack` (also `eliware-test --pack`); require a pass from the global aggregate harness and its pack stage before publication. npm Trusted Publishing uses OIDC and provenance with no static npm token. Exact-version public npm registry verification: verify the exact package.json version for `@eliware/tagit` is visible at `registry.npmjs.org` by running `tagit release-wait`. Eli and the project developer run TagIt preflight together; Eli decides release readiness and instructs DevOps, and DevOps executes the authorized release. Publication requires explicit authorization through the applicable Operations release handoff; these instructions do not authorize an agent to publish.
