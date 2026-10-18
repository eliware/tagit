# Command guide

Run TagIt commands from the root of the target repository. Install TagIt and its required tools first. See the [requirements guide](requirements.md).

## Install TagIt

Install the global command:

```text
npm install --global @eliware/tagit
```

Or run TagIt without a global install:

```text
npx --yes @eliware/tagit --help
```

The npm package provides three commands: `tagit`, `push`, and `upstream`. The `push` command runs the same action as `tagit push`.

## Show help or version

Run `tagit --help` or `tagit -h` to show command help. Run `tagit --version` or `tagit -v` to show the installed version. Do not combine help and version options.

## Report changes

```text
tagit notes
```

This command reports commits and changed files since the latest Git tag. Set the package version before release work. This command does not suggest a version or change files.

## Check release readiness

```text
tagit preflight [--ignore-100x4] [--ignore-monolith-limits]
```

Preflight checks the worktree, branch, package data, required files, workflows, local test command, and exact-commit CI. It reports all local blockers. It requires passing Ubuntu CI for the current commit. It also requires each Windows job to pass when one exists.

Preflight does not accept `--dry-run`. It does not change files, commits, tags, or registry data.

The `--ignore-100x4` option forwards the coverage waiver to `npm test`. The `--ignore-monolith-limits` option forwards the monolith waiver. Use one option only with an approved waiver. These options apply only to `preflight` and `release`.

## Push existing commits

```text
tagit push [--dry-run]
```

The command pushes commits from the current branch. It does not stage files or create commits. It ignores untracked files and reports available CI links.

Use `--dry-run` to skip the push and CI lookup.

## Run a release

```text
tagit release --version X.Y.Z [--dry-run] [--ignore-100x4] [--ignore-monolith-limits]
```

Replace `X.Y.Z` with the version in `package.json`. The version has three numbers and no suffix. The command has no default version.

The command runs preflight on the current commit. If preflight passes, it creates an empty release commit. Its message includes the version and date. It adds `vX.Y.Z` to that commit and pushes the branch and tag atomically. It then polls for CI and one applicable publication workflow. It reports the workflow links and exits.

Use `--dry-run` to check the release path without a version change, commit, tag, push, or publish action. The waiver options have the same limits as preflight.

## Check a release

```text
tagit release-wait
```

The command uses the latest release tag. Do not pass `--version`. It waits for CI on the tagged commit and checks its result. When `npm.yaml` or `ghcr.yaml` matches a publication profile, it also checks publication. It retries registry checks until a fixed time limit. It returns an error if required CI or publication data is missing, incomplete, or failed.

## Merge from upstream

```text
upstream [--dry-run] [merge-message...]
```

The command fetches the configured `upstream` remote, merges its default branch, and pushes the merge. It uses `upstream/HEAD` when Git defines it. If Git does not define that reference, it uses `upstream/main`.

Pass a merge message after the options. If you omit the message, TagIt uses the current UTC time in `YYYY-MM-DD HH:mm:ss` format. The message must not contain more than 500 characters or control characters.

Use `--dry-run` to show the branch and message without fetch, merge, or push actions.

## Errors and exit codes

Commands return `0` when they pass. They return `1` for invalid input, failed checks, or operating errors. TagIt cuts off long error output. TagIt redacts recognized credentials.

A bad option, repeated option, unknown argument, or missing version value returns `1`. `--version` needs a value for `release`. The version query accepts no value. `release-wait` always uses the latest tag.
