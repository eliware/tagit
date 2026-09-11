export function ciFailureMessage(error) {
  if (!error) return null;
  return `BLOCKED: GitHub CI verification failed or was not completed. ${error.message}\nAction: provide a successful Ubuntu run for the exact HEAD; Windows is optional but must pass when present.`;
}
