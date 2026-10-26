# Troubleshooting

Run commands from the target repository root. Read the full error message and use these steps to find the cause.

## GitHub access or CI checks fail

Run `gh auth status` to check GitHub CLI access. Authenticate `gh` with access to the target repository when needed.

Push the exact commit before you run `tagit preflight`. Wait for its Ubuntu CI job to pass. Tagit checks results for the exact commit.

Run preflight from a clean worktree on `main`. Commit or remove intended changes before you retry. Each Windows CI job must pass when the workflow defines one.

If CI has not finished, wait for the exact commit run to pass. Then run `tagit preflight` again.

## Local checks fail

Run `npm test` from the target repository root. Fix each test harness, lint, type, audit, package, or coverage error that applies to the repository profile. Run `npm test` again before you retry preflight.

## The package version does not match

Set `package.json` to the version that you pass to `tagit release --version X.Y.Z`. Run preflight again after you commit and push the version change.

## Release checks report no tag

Run `git tag --list` to inspect local tags. Run `git fetch --tags origin` to fetch tags from `origin`, then retry `tagit release-wait`.

Tagit checks the latest Git tag. It requires a three-part semantic version, such as `v1.2.3`.

## Release does not find a workflow run

Check if the release commit and tag reached `origin` before you retry the release command. Run `git log -1 --oneline` and `git ls-remote --tags origin vX.Y.Z` to check the pushed refs.

If the tag exists, do not run the release command again. Run `tagit release-wait` to check the tag while GitHub Actions starts or completes the workflows.

If the tag does not exist, inspect the local branch and tag state. Resolve a push that updated only one ref before you retry.

## A registry check does not run

Tagit checks npm only when `eliware.apply` contains `npm-published` and `.github/workflows/npm.yaml` exists.

Tagit checks GHCR only when `eliware.apply` contains `ghcr-published` and `.github/workflows/ghcr.yaml` exists.

Add the matching profile and workflow when the repository publishes to a registry. When a profile or workflow is missing, release-wait checks CI and skips publication checks.

## Registry visibility checks fail

Open the publication workflow link and confirm that its publish job passed. Check that the exact package version or image tag exists in the registry.

For npm, confirm that the package is public before you run a public visibility check. Tagit skips that check for private packages.

For GHCR, confirm that the image has the expected version tag and digest. Confirm that GitHub CLI can access the package.

## The upstream command fails

Run `git remote -v` and confirm that the `upstream` remote exists. Check that `upstream/HEAD` or `upstream/main` exists.

If Git reports a merge conflict, resolve the conflict and complete the merge before you retry the command. Do not retry while the repository has an unfinished merge.

## A release command stops after a Git error

Inspect local and remote branches and tags before you retry. Do not move or delete a release tag. Ask the release owner to reconcile the state when a push may have completed.

## The target is a template repository

When the target contains `.notag`, the release command skips release actions. Remove `.notag` only when the repository must create releases.
