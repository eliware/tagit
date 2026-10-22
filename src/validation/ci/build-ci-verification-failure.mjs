export function buildCiVerificationFailure(candidates, headSha) {
  const matching = candidates.filter((run) => run.headSha === headSha);
  const details = matching
    .map((run) => `run ${run.databaseId} [${run.status}/${run.conclusion}]`)
    .join(", ");
  return details
    ? `No passing GitHub Actions run exists for ${headSha}. Observed: ${details}`
    : `No passing GitHub Actions run exists for ${headSha}.`;
}
