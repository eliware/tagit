# Validation behavior

## Local validation ownership

The target repository's `scripts.test` command must invoke the approved shared
Eliware test harness, normally `eliware-test`. The target must declare
`@eliware/test` as a dev dependency, and its installed package must not be a
local symlink or junction. That harness owns:

- tests and 100×4 coverage;
- lint and warning reporting;
- type checking;
- production dependency audit;
- package validation; and
- applicable project, smoke, integration, regression, or end-to-end checks.

Tagit invokes `npm test` as the single authoritative local validation command.
It intentionally does not rerun those checks individually or parse test output
to duplicate the harness's policy.

Diagnostic waivers are explicit and paired: `tagit preflight --ignore-100x4`
or `tagit release --version X.Y.Z --ignore-100x4` forwards
`--ignore-100x4` to `eliware-test`; the analogous
`--ignore-monolith-limits` flag forwards only the monolith waiver. Without the
matching TagIt flag, neither waiver is passed through.

## Repository checks

Preflight checks the repository root, clean `main` worktree, required metadata,
required documentation, workflow policy, secret-looking tracked paths, and
`.notag` behavior. It also requires successful Ubuntu CI for the exact local
HEAD. Windows is optional, but present Windows jobs must pass. Malformed
GitHub run or job records are reported with their location and remediation
guidance; they are never silently ignored.

## Evidence rules

Successful local validation does not replace CI evidence. CI must refer to the
exact commit being handed off. Missing, stale, mismatched, pending beyond the
polling budget, cancelled, or failed required evidence blocks preflight.

Failures include bounded output and an actionable next step. No coverage
exclusion directives are used to hide untested production logic.
