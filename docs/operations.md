# Operations guide

Tagit checks release readiness and publication. It does not deploy applications or edit GitOps repositories. Run each command from the target repository root.

## Prepare an owner handoff

1. Update the code, package data, documentation, tests, and release notes.
2. Set `package.json` to the planned release version.
3. Run `tagit notes` and inspect its commit list, changed files, and diff excerpt.
4. Commit the intended changes and push them to `main`.
5. Wait for CI on that exact commit.
6. Run `tagit preflight` after CI passes.
7. Give DevOps the commit ID and package version after preflight passes.

Do not hand off a different commit. Preflight checks CI for the current commit. Fix every reported blocker, push the repair, wait for its CI, and run preflight again.

## Run a release

DevOps must confirm release approval through the Eliware Operations process. Then run:

```text
tagit release --version X.Y.Z
```

Use the exact version from `package.json`. Tagit runs preflight on the current commit and stops if preflight fails. If it passes, tagit creates an empty release commit with the version and date. The `vX.Y.Z` tag points to that commit. Tagit pushes the commit and tag to `main` in one atomic operation.

Tagit waits until GitHub Actions starts CI and each applicable publication workflow. It reports the workflow links and exits. A workflow link means that the run started. It does not mean that the run passed.

## Check the release

After tagit reports workflow links, run:

```text
tagit release-wait
```

Tagit checks CI for the commit that the latest release tag identifies. It checks the npm or GHCR workflow only when the package profile and matching workflow both exist. It also confirms registry visibility when publication applies. If no publication profile and workflow pair applies, release-wait ends after CI passes.

## Understand command roles

Project owners prepare changes and run `notes`, `push`, and `preflight`. DevOps runs `release` and `release-wait` after the owner handoff and release approval.

These roles describe the organization process. Tagit does not authenticate operators or enforce job titles.

## Resolve a failure

1. Read the error and follow its action.
2. Check the target commit and the linked GitHub Actions run.
3. Repair the cause in the repository that owns it.
4. Commit and push the repair.
5. Wait for CI on the new commit.
6. Run `tagit preflight` again.

If a tag operation fails after a remote action, inspect the local and remote tag before you retry. Do not move or delete a release tag. Ask the release owner to reconcile the observed state.

## Use a template repository

If the target contains `.notag`, tagit validates the template but skips release actions. It does not create a release commit or tag, push release refs, or verify registry publication.

## Keep deployment in GitOps

Tagit does not deploy application workloads or change production state. Use the organization GitOps repository and its pull request process to update deployment pins. The GitOps owner controls deployment and rollback.
