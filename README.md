# @eliware/tagit

Cross-platform, AI-oriented release automation for Eliware projects.

## Commands

Run from the target repository root:

```text
tagit notes
tagit preflight
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

`tagit release --version X.Y.Z` requires an explicit version. It runs
preflight, updates version files, commits, creates `vX.Y.Z`, pushes the commit
and tag, monitors the tag workflow, verifies npm/GHCR when applicable, waits
briefly before npm checks, prints workflow/job links, and exits non-zero on
post-release failure.

There is no automatic version bump, release dry-run, release branch, coverage
waiver, or lint-warning waiver.

## Template repositories

Create `.notag` in a template repository. Preflight still runs all checks, but
release skips version changes, commits, tags, pushes, and registry checks.

## Requirements

Windows or Linux; Node.js 26+; npm; Git; authenticated `gh` for CI checks; and
Composer when releasing a project containing `composer.json`.

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
