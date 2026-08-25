# Agent guidance

`@eliware/tagit` provides `tagit preflight` and
`tagit release --version X.Y.Z`. `tagit notes` is a read-only change report
for preparing `RELEASE_NOTES.md`. Run from the target repository root on
Windows or Linux.

## Preflight

Preflight aggregates blockers and reports concise, bounded evidence. It must
confirm a clean `main` worktree, no secrets or unexplained files, correct
metadata/docs/workflows, no `.notag` conflict, 100x4 coverage, zero lint
errors/warnings, production audit, package dry-run, applicable project checks,
and successful Ubuntu and Windows CI for the exact local HEAD.

Pending CI is monitored until completion. Missing, stale, mismatched, failed,
or cancelled CI blocks. Dirty changes block CI validation because CI cannot
cover them. Reports include failure output and remediation, truncated to
protect agent context. Do not use Istanbul/c8 coverage exclusions; coverage
does not replace smoke, integration, regression, or E2E tests when applicable.

## Release

Release requires an explicit version; automatic bumping is unsupported. After
preflight it updates metadata, commits, creates `vX.Y.Z`, and pushes on `main`.
It monitors the tag workflow, verifies required Ubuntu/Windows and publish
jobs, checks npm/GHCR when applicable, prints links, and exits non-zero for
post-release failure. Never create release branches.

For template repositories, `.notag` retains all preflight checks but makes
release validation-only: no version update, commit, tag, push, or publishing.

## Development rules

- Keep source ESM `.mjs` and preserve dependency injection.
- Use `bin/*-cli.mjs` wrappers; do not execute library modules casually.
- Add tests for every branch or command-order change and maintain 100x4.
- Run `npm test`, `npm run lint`, and `npm run pack` after changes.
- Never push, tag, publish, or release without explicit authorization.
- Update README and release notes when behavior changes.
