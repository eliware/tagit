# Troubleshooting

Run commands from the target repository root. Read the full error message and use these steps to find the cause.

## GitHub access or CI checks fail

Run `gh auth status` to check GitHub CLI access. Authenticate `gh` with access to the target repository when needed.

Push the exact commit before you run `tagit preflight`. Wait for its Ubuntu CI job to pass. Tagit checks results for the exact commit.

Run preflight from a clean worktree on `main`. Commit or remove intended changes before you retry. Each Windows CI job must pass when the workflow defines one.

## The package version does not match

Set `package.json` to the version that you pass to `tagit release --version X.Y.Z`. Run preflight again after you commit and push the version change.

## Release checks report no tag

Run `git tag --list` to inspect local tags. Run `git fetch --tags origin` to fetch tags from `origin`, then retry `tagit release-wait`.

Tagit checks the latest Git tag. It requires a three-part semantic version, such as `v1.2.3`.

## A registry check does not run

Tagit checks npm only when `eliware.apply` contains `npm-published` and `.github/workflows/npm.yaml` exists.

Tagit checks GHCR only when `eliware.apply` contains `ghcr-published` and `.github/workflows/ghcr.yaml` exists.

Add the matching profile and workflow when the repository publishes to a registry. When a profile or workflow is missing, release-wait checks CI and skips publication checks.

## A release command stops after a Git error

Inspect local and remote branches and tags before you retry. Do not move or delete a release tag. Ask the release owner to reconcile the state when a push may have completed.

## The target is a template repository

When the target contains `.notag`, the release command skips release actions. Remove `.notag` only when the repository must create releases.
