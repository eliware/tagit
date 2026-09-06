# Agent guidance

Applies to: the entire `@eliware/tagit` repository unless a more specific
`AGENTS.md` exists in a descendant directory.

`@eliware/tagit` provides `tagit notes`, `tagit preflight`, `tagit push`,
`tagit release --version X.Y.Z`, and `tagit release-wait`. Run from the target
repository root on Windows or Linux.

## Preflight

Preflight aggregates blockers and reports concise, bounded evidence. It must
confirm a clean `main` worktree, repository metadata and `.notag` policy, the
target repository's declared `npm test` harness, which must invoke an installed
non-linked `@eliware/test` dev dependency, and successful Ubuntu CI for
the exact local HEAD; the shared harness owns coverage, lint, audit, package,
and project checks. Windows CI is optional, but any Windows workflow that is
present must pass.

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

`--ignore-100x4` and `--ignore-monolith-limits` are DevOps-only, explicitly
documented waivers for `tagit preflight` or `tagit release`. Each waiver is
forwarded to the shared `eliware-test` command only when the matching TagIt
flag is present; all other gates remain mandatory. Project owners must not use
them.

Release requires an explicit version; automatic bumping is unsupported. After
preflight it confirms `package.json` already matches the version, creates
`vX.Y.Z`, and pushes only that tag on `main`; it never rewrites or commits
files.
It discovers the tag workflow and prints links, then `release-wait` monitors
CI, verifies required Ubuntu and publish jobs (Windows is optional), checks npm/GHCR when
applicable, and exits non-zero for post-release failure. Never create release
branches.

`tagit push` pushes existing commits without staging or committing. Untracked
files are ignored. It prints available exact-HEAD CI links and exits without
waiting or tagging.

`tagit push --dry-run` performs no push or CI lookup. DevOps may use
`tagit release --version X.Y.Z --dry-run` to run preflight without changing
versions or creating commits, tags, pushes, or publications. Dry-run mode must
not be used to bypass the owner/DevOps command boundary.

For template repositories, `.notag` retains all preflight checks but makes
release validation-only: no version update, commit, tag, push, or publishing.

## Development rules

- Keep source ESM `.mjs` and preserve dependency injection.
- Use `bin/*-cli.mjs` wrappers; do not execute library modules casually.
- Add tests for every branch or command-order change and maintain 100x4.
- Run `npm test` after changes. The shared `@eliware/test` harness invoked by
  `npm test` owns lint, typecheck, audit, package validation, coverage, and
  other applicable project checks; do not duplicate those checks in Tagit.
- Project owners must never tag, publish, release, or run release-wait; DevOps
  owns release and post-release verification after preflight passes.
- Update README and release notes when behavior changes.
