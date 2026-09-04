export function coverageWaiverPolicy(ignore100x4) {
  return { ignored: ignore100x4 === true, requiresDevOps: ignore100x4 === true };
}
