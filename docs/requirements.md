# Requirements

## Tools

Install Node.js 26 or later, npm, Git, and GitHub CLI (`gh`). Tagit uses GitHub CLI to read GitHub Actions runs.

Run `gh auth login` to authenticate GitHub CLI. Run `gh auth status` to confirm access to the target repository.

Set the target repository's `origin` remote to its GitHub repository. Use `git remote -v` to check the remote names and URLs.

Install tagit with `npm install --global @eliware/tagit`. Run `tagit --help` to list commands. Use `npx --yes @eliware/tagit --help` when you do not want a global install.

## Target repository

Every target must include `package.json` and a `.github/workflows/ci.yaml` workflow. This includes workspaces, infrastructure, documentation, and applications that do not publish packages. A publication workflow is optional.

The active Eliware Test profile can require other repository files and checks. Read `node_modules/@eliware/test/specs/conventions/` for the current rules and complete list of checks.

Run these commands from the target repository root to add the test package and test command:

```text
npm install --save-dev @eliware/test@latest
npm pkg set scripts.test=eliware-test
npm install
```

Set `scripts.test` to `eliware-test`. Add `@eliware/test` as a development dependency. Install the declared package in `node_modules`. Do not use a local link or junction. The installed version must satisfy the declared version range.

For the `@eliware/test` repository, do not add itself as a development dependency. Set `scripts.test` to `node bin/eliware-test.mjs`.

Preflight requires a clean worktree on the `main` branch. It runs the local `npm test` command and checks GitHub Actions for the exact current commit. Ubuntu CI must pass. Each Windows job must pass when the CI workflow defines one. Tagit reads runner labels from the CI workflow. A missing Windows job does not stop preflight.

Run `npm test` before you run preflight to see local convention or test failures. Read the output and fix each blocker before you continue.

Run preflight after CI passes on the commit that you plan to release. If the commit changes, wait for CI on the new commit and run preflight again.

## Publication profiles

Publication is optional. Tagit checks a registry only when the package profile and matching workflow both exist.

| Profile in `package.json` | Required workflow             | Release check                                                               |
| ------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| `npm-published`           | `.github/workflows/npm.yaml`  | Check the publish job and confirm the exact package version appears in npm. |
| `ghcr-published`          | `.github/workflows/ghcr.yaml` | Check the publish job and confirm the exact image tag and digest in GHCR.   |

If a profile or its workflow does not exist, tagit skips that registry. A repository does not require a publication workflow. Tagit skips public npm visibility checks for private packages. An npm-published public package requires a valid package name.

For GHCR publication, the active Eliware Test conventions define the required workflow trigger, environment, and image push steps. Inspect those conventions when you add or change the workflow. Tagit checks that the published image has the expected version tag and digest.

## Release behavior

Before release, set `package.json` to the intended version and complete the owner handoff. Run `tagit release --version X.Y.Z` with the same version. Tagit runs preflight first. If preflight passes, tagit creates an empty commit, adds the `vX.Y.Z` tag, and pushes both refs to `main` atomically.

Run `tagit release --version X.Y.Z --dry-run` to check that the package version matches. The command skips preflight, the release commit, the tag, the push, and publication.

Tagit checks for the exact-tag CI run after it pushes the release commit and tag. It reports CI and job links after GitHub lists the run. It does not check publication workflows or registry visibility. The links do not confirm that CI passed. Run `tagit release-wait` to verify CI, applicable publication workflows, and registry visibility. When no publication workflow applies, release-wait ends after tagged-commit CI passes.

If `.notag` exists, the release command reports that it skipped release actions. It does not create a release commit or tag, push release refs, or verify publication.

## Supported systems

The CI verification policy requires Ubuntu. It also requires each Windows job when the workflow defines one. Tagit does not directly test macOS. Shared Node.js and Git behavior may work on macOS, but this repository does not verify that support.

## Settings and data

No configuration file is required. Tagit uses the shared logger's default `info` level. Tagit runs as a command and exits after it completes. It stores no database or secret data.

The `upstream` command also requires an `upstream` Git remote. It uses `upstream/HEAD` when Git defines it. When Git does not define that reference, tagit uses `upstream/main`.

Keep credentials, `.env` files, and private data out of Git. Tagit redacts recognized credentials from error output.
