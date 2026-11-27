import summarizeCiJobs from "./summarize-ci-jobs.mjs";

export default function buildPlatformVerificationFailure(execFileSync, candidates, headSha) {
  const jobSummary = summarizeCiJobs(execFileSync, candidates);
  return `Passing GitHub Actions run for ${headSha} lacks a passing Ubuntu job. Jobs: ${jobSummary}`;
}
