import { selectLatestRun } from "./select-run.mjs";
import { verifyCompletedRun } from "./verify-completed-run.mjs";
import { pollPendingRun } from "./poll-pending-run.mjs";
import { readExactHeadRuns } from "./read-exact-head-runs.mjs";
import { validateCompletedConclusion } from "./validate-completed-conclusion.mjs";
import { selectCiCandidate } from "./select-ci-candidate.mjs";
import {
  buildCiVerificationFailure,
  buildPlatformVerificationFailure,
} from "./build-ci-verification-failure.mjs";
import { readRepositoryName } from "../../github/links/read-repository-name.mjs";

export function verifyLatestCi(
  execFileSync,
  log,
  { headSha, repository = null, waitForCompletion = true, runnerLabelsByJobName = {} } = {},
  pollAttempt = 0,
  selectedRun = null,
) {
  if (!headSha) throw new Error("A commit SHA is required for CI verification.");
  const repo = repository ?? readRepositoryName(execFileSync);
  const { repoArg, runs } = readExactHeadRuns(execFileSync, headSha, repo, selectedRun);
  const latest = selectLatestRun(runs, headSha);
  validateCompletedConclusion(latest);
  const { candidates, pending } = selectCiCandidate(latest, headSha);
  if (waitForCompletion && pollPendingRun(execFileSync, log, pending, repoArg, pollAttempt))
    return verifyLatestCi(
      execFileSync,
      log,
      { headSha, repository: repo, waitForCompletion: true, runnerLabelsByJobName },
      pollAttempt + 1,
      pending,
    );
  if (!candidates.length) {
    throw new Error(buildCiVerificationFailure(runs, headSha));
  }
  for (const run of candidates) {
    const result = verifyCompletedRun(execFileSync, log, run, headSha, runnerLabelsByJobName);
    if (result) return result;
  }
  throw new Error(buildPlatformVerificationFailure(execFileSync, candidates, headSha));
}
