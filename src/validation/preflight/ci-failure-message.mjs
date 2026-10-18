export function ciFailureMessage(error) {
  if (!error) return null;
  return `BLOCKED: GitHub CI check failed or did not complete. ${error.message}\nAction: provide a passing Ubuntu run for the exact commit. Windows CI is optional. Each Windows job must pass when one exists.`;
}
