# Operations

TagIt is a release-coordination CLI, not a deployable service. Run it from the
root of the target repository.

Project owners run `tagit notes`, `tagit push`, and `tagit preflight`. DevOps
uses the verified handoff to run `tagit release --version X.Y.Z` and
`tagit release-wait`. TagIt never deploys application workloads or edits
GitOps repositories.

For troubleshooting, inspect the bounded blocker output, confirm the exact
commit and GitHub Actions run, and rerun preflight after correcting the
reported condition. Failed remote tag operations may require DevOps
reconciliation; do not move or delete release tags automatically.

TagIt has no service ports, health endpoint, database, backup set, or runtime
secret store. Its only configuration input is the optional `LOG_LEVEL`
environment override used by the shared logger.
