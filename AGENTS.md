# AGENTS.md

Guidance for coding agents working on this repository.

## Project Overview

`@eliware/tagit` is a Node.js ESM CLI for release automation. It bumps a target project's version, updates `composer.json` and/or `package.json`, runs dependency/build commands, commits the result, creates a Git tag, and pushes commits/tags.

The CLI is Linux-focused and intended to be run from the root of the project being released.

## Important Files

- `tagit.mjs`: CLI entrypoint.
- `src/updateVersionFiles.mjs`: Reads and updates `composer.json` / `package.json` versions.
- `src/incrementVersion.mjs`: Increments the final numeric version segment.
- `src/gitOperations.mjs`: Runs Composer, npm, webpack, and Git commands.
- `tests/*.test.mjs`: Jest tests using mocked filesystem and command execution.
- `.github/workflows/nodejs.yml`: Publishes to npm when a Git tag is pushed.

## Development Commands

```bash
npm test
```

The test suite is local and uses Jest. Existing tests mock shell commands, so they verify command sequencing and branching rather than real Composer/npm/Git side effects.

## Runtime Flow

1. `tagit.mjs` loads environment variables with `dotenv/config`.
2. It registers handlers/signals from `@eliware/common`.
3. It exits early when `NODE_ENV === 'test'`.
4. It exits successfully if `.notag` exists in the current directory.
5. It calls `updateVersionFiles(fs, log)`.
6. It calls `gitOperations(execSync, fs, log, newVersion)`.

## Versioning Rules

- If `composer.json` exists, its `version` is bumped first.
- If `package.json` also exists, it is synced to the composer-derived version.
- If only `package.json` exists, its `version` is bumped.
- The bump logic increments the final dot-separated numeric segment, for example `1.2.3` becomes `1.2.4`.
- Each detected version file must contain a `version` field.

## Release Side Effects

Be careful when changing `src/gitOperations.mjs`. The real CLI can run:

```bash
COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer upgrade
COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer bump
npm upgrade
git add -A
git commit -m 'Version <version> - MM-DD-YYYY'
git tag <version>
git push
git push --tags
```

Webpack builds are run when webpack is detected through dependencies or `webpack.config.js` / `webpack.config.mjs`. Build command preference is:

```bash
npm run build
npm run webpack
npx webpack
```

## Agent Guidelines

- Prefer small, targeted changes. This project is intentionally compact.
- Keep source files as ESM `.mjs`.
- Preserve dependency injection in exported functions where practical; it keeps tests simple and avoids real shell/filesystem side effects.
- Do not run `tagit.mjs` casually from this repository or another project unless explicitly asked. It can mutate files, commit, tag, and push.
- Do not run real `git push`, `git tag`, `npm upgrade`, `composer upgrade`, or release commands unless explicitly requested.
- Run `npm test` after code changes when feasible.
- Update README behavior descriptions when CLI behavior changes.
- Add or adjust tests for command-order or branching changes in release logic.

## Current Known Risks

- If no version file exists, `updateVersionFiles` returns `null`; downstream Git operations may still attempt to commit/tag.
- Version strings are not strictly validated.
- Release commands use shell strings and should be treated carefully.
- `npm upgrade` and `composer upgrade` can introduce dependency changes during a release.
