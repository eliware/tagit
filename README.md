# @eliware/tagit

Cross-platform, AI-oriented release automation for Eliware projects.

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
