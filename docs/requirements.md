# Requirements

## Tools

Install Node.js 26 or later, npm 12 or later, Git, and GitHub CLI (`gh`). Use GitHub CLI for CI and release checks. Set up access to the target GitHub repository.

Install TagIt with `npm install --global @eliware/tagit`. Run `tagit --help` to list commands.

## Target repository

Preflight requires every target repository to provide these files:

- `package.json`
- `README.md`
- `AGENTS.md`
- `RELEASE_NOTES.md`
- `docs/`
- `specs/`
- `.github/workflows/ci.yaml`

If the target declares supported runtime environment configuration, it must include `.env.example`.
Every target package must declare `@eliware/test` as a development dependency. Set `scripts.test` to `eliware-test`.

For the `@eliware/test` repository, do not add itself as a development dependency. Set `scripts.test` to `node bin/eliware-test.mjs`.

Publication is optional. Check npm or GHCR only when `package.json` declares the matching `eliware.apply` profile and `.github/workflows/publish.yaml` exists. npm publication also needs a valid package name, version, and repository URL.

The test package must be an installed package. Do not use a local link or junction for `@eliware/test`.

Preflight requires a clean `main` branch and successful Ubuntu CI for the current commit. It requires each Windows job to pass when one exists. It does not report a Windows check when the workflow has no Windows job.

Release runs preflight, then adds an empty commit with the release version and date. TagIt pushes the new commit and version tag to `main` in one atomic operation. It reports CI and applicable publication links after those workflows start.

## Supported systems

GitHub Actions CI directly checks Ubuntu. Tests cover Windows-specific behavior. TagIt does not directly test macOS. macOS support follows shared Node.js and Git behavior.

## Settings

TagIt needs no configuration file. The optional `LOG_LEVEL` environment variable sets the shared logger level. TagIt starts no service and uses no service port, database, or secret store.

## npm package contents

The package includes `bin/`, `src/`, `docs/`, and `specs/`. It also includes `README.md`, `AGENTS.md`, `LICENSE`, and `RELEASE_NOTES.md`. It excludes tests, fixtures, workflow files, lockfiles, and runtime secrets.

The package provides `tagit`, `push`, and `upstream` commands. It does not include a stable API for internal source modules. Use only the public commands and documented options.
