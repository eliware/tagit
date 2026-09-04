# Release workflow

## Owner handoff

1. The project owner updates code, documentation, metadata, and release notes.
2. The owner runs `tagit notes` and reviews the complete change report.
3. The owner commits the intended changes.
4. The owner runs `tagit push`.
5. The owner waits for CI on that exact pushed commit.
6. The owner runs `tagit preflight` and hands off only after it passes.

Project owners do not run `tagit release` or `tagit release-wait`. This is a
workflow rule, not an in-app authentication boundary.

## DevOps release

After the owner handoff passes, DevOps may run:

```text
tagit release --version X.Y.Z
tagit release-wait
```

The version must be explicit. Tagit confirms repository metadata already matches
it. Automatic version selection and version-file mutation are not part of the
release operation.

## Safety rules

- Only the release tag may be created or pushed by the release operation.
- No release branch is created.
- No unrelated or untracked files are staged.
- A tag that points to another commit blocks the operation.
- Remote tag verification must match the intended commit.
- Post-push verification failures report observed state and require operator
  reconciliation; Tagit does not delete published tags automatically.

## Template repositories

When `.notag` is present, validation still runs, but release behavior is
validation-only. No version update, commit, tag, push, publication, or
post-release registry verification occurs.
