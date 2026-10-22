import { selectLatestRun } from "../select/run.mjs";
import { verifyCompletedRun } from "./completed-run.mjs";
import { retryPendingRun } from "./pending-run.mjs";
import { readExactHeadRuns } from "../read/exact-head/runs.mjs";
import { validateCompletedConclusion } from "../validate/completed-conclusion.mjs";
import { selectCiCandidate } from "../select/ci-candidate.mjs";
import { createCiVerificationFailure } from "./result-policy.mjs";
import { readRepositoryName } from "../../../repository/repository-name/read-repository-name.mjs";

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
  const { candidates, pending } = selectCiCandidate(runs, headSha);
  for (const run of candidates) {
    const result = verifyCompletedRun(execFileSync, log, run, headSha, runnerLabelsByJobName);
    if (result) return result;
  }
  if (waitForCompletion) {
    const retried = retryPendingRun(execFileSync, log, pending, repoArg, pollAttempt, () =>
      verifyLatestCi(
        execFileSync,
        log,
        { headSha, repository: repo, waitForCompletion: true, runnerLabelsByJobName },
        pollAttempt + 1,
        null,
      ),
    );
    if (retried) return retried;
  }
  throw createCiVerificationFailure(execFileSync, candidates, runs, headSha);
}
