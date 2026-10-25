# AGENTS.md

## Project

See README.md for repository purpose, owner, and scope.

## Scope and boundaries

Tagit does not deploy applications.

## Layout

Use README.md and specs/README.md to find maintained files.

## Development

Use Node.js 26 or later and native ESM for maintained JavaScript modules.

## Validation

Run npm test for aggregate validation.
Run npm run lint for lint checks.
Run npm run audit for dependency checks.
Run npm run format to format files.
Run npm run format:check to check formatting.

## Security

Keep credentials, secrets, private data, and runtime state out of Git.

## Changes

Keep requirements in specs/directives.yaml.

## Application

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## CLI

Keep `--help` and `--version` read-only.

## npm publication

Follow Eliware Operations procedures for release approval.
