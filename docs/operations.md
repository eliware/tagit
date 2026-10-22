# Operations guide

The `tagit` command coordinates release checks. It does not deploy applications or edit GitOps repositories. Run each command from the target repository root.

## Prepare an owner handoff

1. Update code, documentation, package data, and release notes.
2. Set the package version for the release. Run `tagit notes` and inspect its change list.
3. Commit the intended changes.
4. Run `tagit push`.
5. Wait for CI on the exact commit.
6. Run `tagit preflight` after CI passes.
7. Give DevOps the commit ID and package version after preflight passes.

Do not hand off a different commit. Preflight checks CI for the current commit.

## Run the release

DevOps uses the owner handoff and the approved release process. Run:

```text
tagit release --version X.Y.Z
```

Use the exact version from `package.json`. The `tagit` command runs preflight on the current commit and stops if it fails. If preflight passes, it adds an empty release commit and creates `vX.Y.Z` on that commit. It pushes the branch and tag in one atomic operation. It waits for CI and each applicable publication workflow to start, then reports their links.

The release commit does not change files. Its message includes the release version and date. The commit gives CI a new commit to check. The tag points to that commit.

## Check the release

After tagit reports the workflow links, run:

```text
tagit release-wait
```

The `tagit` command checks CI for the tagged commit. When `npm.yaml` or `ghcr.yaml` matches a publication profile, it checks that workflow and verifies the registry. Without an applicable publication workflow, the command ends after CI passes.

## Understand command roles

Project owners prepare changes and run `notes`, `push`, and `preflight`. DevOps runs `release` and `release-wait` after the owner handoff.

These role rules describe the organization workflow. The `tagit` command does not authenticate operators or enforce job titles.

## Resolve a failure

1. Read the error and its required action.
2. Check the target commit and linked GitHub Actions run.
3. Repair the reported cause in the owning repository.
4. Commit and push the repair.
5. Wait for CI on the new commit.
6. Run preflight again.

If a tag operation fails after a remote action, inspect the local and remote tag. Do not move or delete a release tag to retry. Ask the release owner to reconcile the observed state.

## Use a template repository

If the target contains `.notag`, the `tagit` command runs validation but skips release actions. It does not update versions, commit, tag, push, or check registry publication for that target.

## Keep deployment in GitOps

The `tagit` command does not deploy application workloads or change production state. Use the organization GitOps repository and its pull request flow to update deployment pins. The GitOps owner controls deployment and rollback.
