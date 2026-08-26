# @eliware/tagit

Cross-platform, AI-oriented release automation for Eliware projects.

Tagit is a repository-root CLI. It validates local release readiness, reports
changes, pushes existing commits, and provides DevOps release verification.

## Commands

Run from the target repository root:

```text
tagit notes
tagit preflight
tagit push
tagit release --version X.Y.Z
```

`tagit notes` is read-only. It summarizes changes since the latest tag,
suggests a SemVer level, and gives concise instructions for release notes.

`tagit preflight` is read-only and aggregates blockers. It checks the clean
`main` worktree, metadata, `.notag` policy, 100% statements/branches/
functions/lines (100x4), zero-warning lint, audit, package contents, required
project checks, and successful Ubuntu and Windows CI for the exact HEAD.
Pending CI is monitored until completion. Failures include bounded output and
actionable remediation. Dirty changes block CI validation.

`tagit push` pushes existing commits only. It never stages or commits changes,
ignores untracked files, prints CI workflow/job links for the pushed HEAD, and
exits without waiting.

`tagit release --version X.Y.Z` requires an explicit version. It runs
preflight, updates version files, commits, creates `vX.Y.Z`, and pushes the
commit and tag. It discovers the release workflow, prints workflow/job links,
and exits with instructions to run `tagit release-wait`.

`tagit release-wait` resumes the release by monitoring CI to completion,
verifying npm/GHCR when applicable, waiting briefly before npm checks, and
exiting non-zero with bounded failure details.

## Command ownership

Project owners may run only `tagit notes`, `tagit push`, and `tagit preflight`.
Project owners must never run `tagit release` or `tagit release-wait`. The
DevOps team runs those commands only after the owner handoff and exact-HEAD
preflight has passed.

There is no automatic version bump, release dry-run, release branch, coverage
waiver, or lint-warning waiver.

## Template repositories

Create `.notag` in a template repository. Preflight still runs all checks, but
release skips version changes, commits, tags, pushes, and registry checks.

## Requirements

Windows or Linux; Node.js 26+; npm; Git; authenticated `gh` for CI checks; and
Composer when releasing a project containing `composer.json`.

## Installation and configuration

Install globally with `npm install --global @eliware/tagit`, or invoke it with
`npx @eliware/tagit`. Run commands from the target repository root. Tagit reads
Git, npm, GitHub CLI, and repository files; it has no configuration file and
does not require environment variables. Authenticate `gh` using its normal
secure credential store. Never place tokens in `.env` files or command output.

## Public API

The package entrypoint is the `tagit` executable. Library modules under `src/`
are implementation details; use the CLI wrappers (`tagit`, `push`, and
`upstream`) so signal handling, output, and exit codes remain consistent.

## Security and operations

`notes` and `preflight` are read-only. `push` pushes existing commits and does
not stage or commit files. Release and publication commands are DevOps-only.
Preflight blocks dirty worktrees, secret-looking tracked files, missing project
metadata, failed local checks, and missing exact-HEAD CI evidence. A failed
release restores version files; inspect status before retrying an interrupted
operation. Tagit never stores credentials or deploys application workloads.

## Validation

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm audit --omit=dev --audit-level=moderate
npm run pack
```

Smoke test the public entrypoint with `tagit --help` and `tagit notes` from a
repository root. Both commands are safe to run without release authorization.

## Development

```bash
npm test
npm run lint
npm run pack
```

Keep source as ESM, preserve injectable command execution, test every branch,
maintain 100x4, and do not use Istanbul or c8 ignore directives.

## License

[MIT © Eli Sterling, eliware.org](LICENSE)
