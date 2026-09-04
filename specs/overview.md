# Tagit behavior specifications

Tagit is a repository-root release coordination tool. These specifications
describe intended user-visible behavior and the boundaries that maintainers,
project owners, DevOps, and automation should rely on.

## Contents

1. [Commands](commands.md)
2. [Release workflow](release-workflow.md)
3. [Validation](validation.md)
4. [GitOps and publication](gitops.md)
5. [Out of scope and unintended behavior](out-of-scope.md)

## Roles in the workflow

Project owners prepare and validate changes. They run `tagit notes`,
`tagit push`, and `tagit preflight`.

DevOps receives the owner handoff after exact-commit preflight succeeds. DevOps
runs the release and post-release verification commands.

These are organizational operating rules. Tagit does not authenticate users or
enforce job titles, teams, or role membership.

## Core guarantees

- Read-only commands do not alter repository files or release state.
- Push operations do not stage or create commits.
- Release operations require an explicit version and never rewrite version files.
- Validation evidence must refer to the exact commit being handed off.
- Failed or incomplete required checks block the workflow.
- Untracked files are not included in a push or release operation.
