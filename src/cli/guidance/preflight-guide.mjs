export function preflightGuide() {
  return `Preflight checklist (all required):
- Run from the repository root on a clean main worktree.
- Confirm .notag is absent and no secrets or unexplained changes exist.
- Confirm package metadata, README, release notes, and CI workflow are current.
- Run npm test: the shared harness owns tests, lint, typecheck, audit, packaging, and 100×4 coverage. The target scripts.test command must invoke that approved harness; TagIt intentionally does not rerun those checks individually.
- Confirm gh reports a successful Ubuntu CI run for this exact HEAD; Windows CI is optional but must pass when present.
- Confirm required smoke, integration, regression, and E2E checks pass when applicable.
Any missing, stale, pending, cancelled, failed, or mismatched check blocks handoff.`;
}
