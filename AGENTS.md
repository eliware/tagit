# AGENTS.md

## Project

TagIt checks release readiness and publication.

## Scope and boundaries

Use README.md for project purpose, scope, and ownership.

## Layout

Use README.md and specs/README.md to find repository files.
Keep implementation modules in src/ and launchers in bin/.
Keep tests in tests/, fixtures in test-fixtures/, and user guides in docs/.

## Development

Keep each source module and test module focused on one task.
Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.

## Validation

Use Node.js 26 or later and npm 12 or later.
Use native ESM for maintained JavaScript modules.
Run `npm run lint`, `npm run audit`, `npm run format`, and `npm run format:check` as separate checks.
Run the full `npm test` suite before a commit, milestone, or release.

## Security

Keep credentials, secrets, private data, and runtime state out of Git.

## Changes

Keep changes in this repository.
Use Eliware Operations for approval before changes to external systems.

## Application

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

Document entrypoints, workflows, settings, startup, and shutdown in README.md.

## CLI

Document commands, options, arguments, defaults, errors, and exit codes in README.md.

## npm publication

Include specs/ in the npm package.
Document install, entrypoints, contents, and release limits in README.md.
