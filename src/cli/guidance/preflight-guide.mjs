export function preflightGuide() {
  return `Preflight checklist (all required):
- Run from the repository root on a clean main worktree.
- Confirm .notag is absent and no secrets or unexplained changes exist.
- Confirm package metadata, README, release notes, and CI workflow are current.
- Run npm test: the shared harness owns tests, lint, typecheck, audit, packaging, and 100×4 coverage. Consumer scripts.test must equal eliware-test. The @eliware/test package must use node bin/eliware-test.mjs.
- Confirm gh reports a successful Ubuntu CI run for this exact HEAD; Windows CI is optional but must pass when present.
- Confirm required smoke, integration, regression, and E2E checks pass when applicable.
Any missing, stale, pending, cancelled, failed, or mismatched check blocks handoff.`;
}
