# Operations guide

TagIt coordinates release checks. It does not deploy applications or edit GitOps repositories. Run each command from the target repository root.

## Prepare an owner handoff

1. Update code, documentation, package data, and release notes.
2. Set the package version for the release. Run `tagit notes` and review its change list.
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

Use the exact version from `package.json`. TagIt runs preflight on the current commit. If it passes, TagIt adds an empty release commit. TagIt creates `vX.Y.Z` on that commit. TagIt pushes the branch and tag in one atomic operation. TagIt then waits for the CI workflow and any applicable publish workflow to start. It reports their links.

The release commit does not change files. Its message includes the release version and date. The commit gives CI a new commit to check. The tag points to that commit.

## Check the release

After TagIt reports the workflow links, run:

```text
tagit release-wait
```

TagIt checks the CI run for the tagged commit. When `publish.yaml` and a matching publication profile exist, TagIt checks that workflow and verifies npm or GHCR. Without an applicable publish workflow, the command ends after CI passes.

## Understand command roles

Project owners prepare changes and run `notes`, `push`, and `preflight`. DevOps runs `release` and `release-wait` after the owner handoff.

These role rules describe the organization workflow. TagIt does not authenticate operators or enforce job titles.

## Handle a failure

1. Read the error and its next step.
2. Check the target commit and linked GitHub Actions run.
3. Fix the reported cause in the owning repository.
4. Commit and push the fix.
5. Wait for CI on the new commit.
6. Run preflight again.

If a tag operation fails after a remote action, inspect the local and remote tag. Do not move or delete a release tag to retry. Ask the release owner to reconcile the observed state.

## Use a template repository

If the target contains `.notag`, TagIt runs validation but skips release actions. It does not update versions, commit, tag, push, or check registry publication for that target.

## Keep deployment in GitOps

TagIt does not deploy application workloads or change production state. Use the organization GitOps repository and its pull request flow to update deployment pins. The GitOps owner controls deployment and rollback.
