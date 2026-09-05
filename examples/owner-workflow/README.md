# Owner workflow example

From a target repository root, run these safe owner commands in order:

```text
tagit notes
tagit preflight
tagit push
```

DevOps runs `tagit release --version X.Y.Z` and `tagit release-wait` only after
the owner handoff and exact-commit preflight have passed. This example does
not execute commands or change repository state.
