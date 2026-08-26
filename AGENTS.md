# Agent guidance

`@eliware/tagit` provides `tagit preflight`, `tagit push`,
`tagit release --version X.Y.Z`, and `tagit release-wait`. `tagit notes` is a read-only change report
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

Project owners may run only `tagit notes`, `tagit push`, and `tagit preflight`.
They must never run `tagit release` or `tagit release-wait`. Those commands are
DevOps-only and may run only after the owner handoff and exact-HEAD preflight
have passed.

Release requires an explicit version; automatic bumping is unsupported. After
preflight it updates metadata, commits, creates `vX.Y.Z`, and pushes on `main`.
It discovers the tag workflow and prints links, then `release-wait` monitors
CI, verifies required Ubuntu/Windows and publish jobs, checks npm/GHCR when
applicable, and exits non-zero for post-release failure. Never create release
branches.

`tagit push` pushes existing commits without staging or committing. Untracked
files are ignored. It prints available exact-HEAD CI links and exits without
waiting or tagging.

For template repositories, `.notag` retains all preflight checks but makes
release validation-only: no version update, commit, tag, push, or publishing.

## Development rules

- Keep source ESM `.mjs` and preserve dependency injection.
- Use `bin/*-cli.mjs` wrappers; do not execute library modules casually.
- Add tests for every branch or command-order change and maintain 100x4.
- Run `npm test`, `npm run lint`, and `npm run pack` after changes.
- Project owners must never tag, publish, release, or run release-wait; DevOps
  owns release and post-release verification after preflight passes.
- Update README and release notes when behavior changes.
