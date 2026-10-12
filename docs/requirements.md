# Requirements

## Tools

Install Node.js 26 or later, npm 12 or later, Git, and GitHub CLI (`gh`). Use GitHub CLI for CI and release checks. Set up access to the target GitHub repository.

Install TagIt with `npm install --global @eliware/tagit`. Run `tagit --help` to list commands.

## Target repository

Preflight requires the target repository to provide these files:

- `package.json`
- `README.md`
- `AGENTS.md`
- `RELEASE_NOTES.md`
- `docs/`
- `specs/`
- `.env.example`
- `.github/workflows/ci.yaml`

Public npm packages also need `.github/workflows/publish.yaml`. The package needs a valid name, version, and repository URL. Its test script must run the shared `@eliware/test` harness through `npm test`.

The test package must be an installed package. Do not use a local link or junction for `@eliware/test`.

Preflight requires a clean `main` branch and successful Ubuntu CI for the current commit. It requires each Windows job to pass when one exists. It does not report a Windows check when the workflow has no Windows job.

## Supported systems

GitHub Actions CI directly checks Ubuntu. Tests cover Windows-specific behavior. TagIt does not directly test macOS. macOS support follows shared Node.js and Git behavior.

## Settings

TagIt needs no configuration file. The optional `LOG_LEVEL` environment variable sets the shared logger level. TagIt starts no service and uses no service port, database, or secret store.

## npm package contents

The package includes `bin/`, `src/`, `docs/`, and `specs/`. It also includes `README.md`, `AGENTS.md`, `LICENSE`, and `RELEASE_NOTES.md`. It excludes tests, fixtures, workflow files, lockfiles, and runtime secrets.

The package provides `tagit`, `push`, and `upstream` commands. It does not include a stable API for internal source modules. Use only the public commands and documented options.
