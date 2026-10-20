# AGENTS.md

## Project

See README.md for repository purpose, ownership, and scope.

## Scope and boundaries

Keep requirements in their authoritative specifications. This repository checks release readiness and publication. It does not deploy applications or edit GitOps repositories.

## Layout

Use README.md and specs/README.md to find maintained files. Keep implementation in src/, launchers in bin/, tests in tests/, fixtures in test-fixtures/, and user guides in docs/.

## Development

Give each source and test module one cohesive purpose. Keep user guides current when behavior changes.

## Validation

Use Node.js 26 or later and native ESM for maintained JavaScript modules. Run npm test for aggregate validation. Run npm run lint for lint checks. Run npm run audit for dependency checks. Run npm run format to format files. Run npm run format:check to check formatting.

## Security

Keep credentials, secrets, private data, and runtime state out of Git.

## Changes

Keep changes in this repository. Follow Eliware Operations procedures for release approval.

## Application

Document workflows, entrypoints, startup, shutdown, and configuration in README.md and docs/.
Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## CLI

Document commands, options, arguments, defaults, errors, and exit codes in README.md and docs/.

## npm publication

Include specs/ in the npm package. Document installation, entrypoints, package contents, version rules, and publication limits.
