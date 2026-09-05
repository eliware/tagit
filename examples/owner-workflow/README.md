# Owner workflow example

Prerequisites: Node.js 26 or newer, Git, GitHub CLI access for CI inspection,
and a target repository with the shared `@eliware/test` development harness.

From a target repository root, run these safe owner commands in order:

```text
tagit notes
tagit preflight
tagit push
```

DevOps runs `tagit release --version X.Y.Z` and `tagit release-wait` only after
the owner handoff and exact-commit preflight have passed. This example does
not execute commands or change repository state.
Expected result: the owner reviews the change report, confirms exact-commit
preflight, and pushes existing commits without creating a tag or publishing.
