# AGENTS.md

## Project

Eliware owns tagit. This repository provides a CLI for release readiness and publication checks.

## Scope and boundaries

Tagit checks release readiness and publication. It does not deploy applications.

## Layout

Keep implementation in src/, launchers in bin/, tests in tests/, and fixtures in test-fixtures/.
Use README.md and specs/README.md to find maintained files.

## Development

Use Node.js 26 or later and native ESM for maintained JavaScript modules.
Give each source and test module one cohesive purpose.
Keep user guides current when behavior changes.

## Validation

Run npm test for aggregate validation.
Run npm run lint for lint checks.
Run npm run audit for dependency checks.
Run npm run format to format files.
Run npm run format:check to check formatting.

## Security

Keep credentials, secrets, private data, and runtime state out of Git.

## Changes

Keep requirements in their authoritative specifications.

## Application

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## CLI

Keep `--help` and `--version` read-only.
Match CLI documentation to the parser and tests.

## npm publication

Follow Eliware Operations procedures for release approval.
