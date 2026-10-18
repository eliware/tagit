export function preflightGuide() {
  return [
    "Preflight checklist:",
    "- Run from the repository root on a clean main worktree.",
    "- Confirm .notag does not exist and no secrets or unexplained changes exist.",
    "- Check package data, README, release notes, and CI workflow.",
    "- Run npm test.",
    "- The shared harness checks tests, lint, type checks, audit, packaging, and coverage.",
    "- Set scripts.test to eliware-test in each target package.",
    "- In @eliware/test, set scripts.test to node bin/eliware-test.mjs.",
    "- Confirm gh reports a passing Ubuntu CI run for the exact commit.",
    "- Windows CI is optional.",
    "- Require each Windows job to pass when one exists.",
    "- Run required smoke, integration, regression, and E2E checks when they apply.",
    "A missing, expired, pending, cancelled, failed, or mismatched check blocks handoff.",
  ].join("\n");
}
