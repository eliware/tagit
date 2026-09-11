import { summarizeCiJobs } from './summarize-ci-jobs.mjs';

export function buildCiVerificationFailure(candidates, headSha) {
  const matching = candidates.filter((run) => run.headSha === headSha);
  const details = matching.map((run) => `run ${run.databaseId} [${run.status}/${run.conclusion}]`).join(', ');
  return details
    ? `No successful GitHub Actions run exists for ${headSha}. Observed: ${details}`
    : `No successful GitHub Actions run exists for ${headSha}.`;
}

export function buildPlatformVerificationFailure(execFileSync, candidates, headSha) {
  const jobSummary = summarizeCiJobs(execFileSync, candidates);
  return `Successful GitHub Actions run for ${headSha} lacks a passing Ubuntu job. Jobs: ${jobSummary}`;
}
