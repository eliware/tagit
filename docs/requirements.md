# Requirements

## Tools

Install Node.js 26 or later, npm, Git, and GitHub CLI (`gh`). Use GitHub CLI to read GitHub Actions runs. Set up access to the target GitHub repository before you run checks or release commands.

Install tagit with `npm install --global @eliware/tagit`. Run `tagit --help` to list commands. You can also use `npx --yes @eliware/tagit` without a global install.

## Target repository

Every target must include `package.json` and a `.github/workflows/ci.yaml` workflow. The active Eliware Test profile can require other repository files and checks. Read the current conventions in the installed test package for the complete list.

Set `scripts.test` to `eliware-test`. Add `@eliware/test` as a development dependency. Install the declared package in `node_modules`. Do not use a local link or junction. The installed version must satisfy the declared version range.

For the `@eliware/test` repository, do not add itself as a development dependency. Set `scripts.test` to `node bin/eliware-test.mjs`.

Preflight requires a clean worktree on the `main` branch. It runs the local `npm test` command and checks GitHub Actions for the exact current commit. Ubuntu CI must pass. Each Windows job must pass when the CI workflow defines one. The check reads runner labels from the workflow. A missing Windows job does not stop preflight.

## Publication profiles

Publication is optional. Tagit checks a registry only when the package profile and matching workflow both exist.

| Profile in `package.json` | Required workflow             | Release check                                                               |
| ------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| `npm-published`           | `.github/workflows/npm.yaml`  | Check the publish job and confirm the exact package version appears in npm. |
| `ghcr-published`          | `.github/workflows/ghcr.yaml` | Check the publish job and confirm the version tag appears in GHCR.          |

If a profile or its workflow does not exist, tagit skips that registry. Tagit skips public npm visibility checks for private packages. An npm-published public package needs a valid package name.

For GHCR publication, the active Eliware Test conventions define the required workflow trigger, environment, and image push steps. Inspect those conventions when you add or change the workflow.

## Release behavior

Before release, set `package.json` to the intended version and complete the owner handoff. Run `tagit release --version X.Y.Z` with the same version. Tagit runs preflight first. If preflight passes, tagit creates an empty commit, adds the `vX.Y.Z` tag, and pushes both refs to `main` atomically.

Tagit waits for CI and each applicable publication workflow to start. It reports the workflow links. Run `tagit release-wait` to verify that the workflows pass and to check each applicable registry. When no publication workflow applies, release-wait ends after tagged-commit CI passes.

If `.notag` exists, release skips versioning, commit, tag, push, and publication actions.

## Supported systems

The CI verification policy requires Ubuntu. It also requires each Windows job when the workflow defines one. Tagit does not directly test macOS. Shared Node.js and Git behavior may work on macOS, but this repository does not verify that support.

## Settings and data

No configuration file is required. Set the optional `LOG_LEVEL` environment variable to change the shared logger level. Tagit runs as a command and exits after it completes. It stores no database or secret data.

Keep credentials, `.env` files, and private data out of Git. Tagit redacts recognized credentials from error output.

## npm package contents

The package includes `bin/`, `src/`, `docs/`, and `specs/`. It also includes `README.md`, `AGENTS.md`, `LICENSE`, and `RELEASE_NOTES.md`. It excludes tests, fixtures, workflow files, lockfiles, and runtime secrets.

The package provides `tagit`, `push`, and `upstream` commands. It does not provide a stable API for internal source modules. Use the public commands and documented options.
