# Operations guide

Tagit checks release readiness and applicable publication for npm packages, GHCR images, workspaces, infrastructure, documentation, and applications that do not publish packages. It does not deploy applications or edit GitOps repositories. Run each command from the target repository root.

## Prepare an owner handoff

1. Read the full diff. Check user-visible, compatibility, and operation changes.
2. Update the code, package data, documentation, tests, and release notes.
3. Set `package.json` to the planned release version.
4. Run `tagit notes` and inspect its commit list, changed files, and diff excerpt.
5. Commit the intended changes and push them to `main`.
6. Wait for CI on that exact commit.
7. Run `tagit preflight` after CI passes.
8. Give DevOps the commit ID and package version after preflight passes.

Do not hand off a different commit. Preflight checks CI for the current commit. Fix every reported blocker, push the repair, wait for its CI, and run preflight again.

## Run a release

DevOps must confirm release approval through the Eliware Operations process. Then run:

```text
tagit release --version X.Y.Z
```

Use the exact version from `package.json`. Tagit runs preflight on the current commit, then checks the package version. It stops if one check fails. If both checks pass, tagit creates an empty release commit with the version and date. The `vX.Y.Z` tag points to that commit.

Tagit pushes the commit and tag to `main` in one atomic operation. The operation updates both refs or leaves both unchanged.

Tagit waits until GitHub Actions starts CI and each applicable publication workflow. It reports the workflow links and exits. A workflow link means that the run started. It does not mean that the run passed. If no publication workflow applies, tagit waits for CI to start.

Use `tagit release --version X.Y.Z --dry-run` to run preflight and check the package version without creating a release commit or tag. The dry run does not push refs or wait for publication.

## Check the release

After tagit reports workflow links, run:

```text
tagit release-wait
```

Tagit checks CI for the exact commit that the latest release tag identifies. It checks the npm or GHCR workflow only when the matching `eliware.apply` profile and workflow both exist. It also confirms registry visibility when publication applies. If no publication profile and matching workflow apply, release-wait ends after CI passes.

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

If the target contains `.notag`, the release command reports that it skipped release actions. It does not create a release commit or tag, push release refs, or verify registry publication.

## Keep deployment in GitOps

Tagit does not deploy application workloads or change production state. Use the organization GitOps repository and its pull request process to update deployment pins. The GitOps owner controls deployment and rollback.
