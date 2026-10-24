import { selectLatestRun } from "../select/run.mjs";
import { verifyCompletedRun } from "./completed-run.mjs";
import { pollExactHeadCi } from "./poll-exact-head.mjs";
import { readExactHeadRuns } from "../read/exact-head/runs.mjs";
import { validateCompletedConclusion } from "../validate/completed-conclusion.mjs";
import { selectCiCandidate } from "../select/ci-candidate.mjs";
import { selectPendingRun } from "../select/pending-run.mjs";
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
  const candidates = selectCiCandidate(runs, headSha);
  const pending = selectPendingRun(runs, headSha);
  for (const run of candidates) {
    const result = verifyCompletedRun(execFileSync, log, run, headSha, runnerLabelsByJobName);
    if (result) return result;
  }
  {
    const retried = pollExactHeadCi({
      execFileSync,
      log,
      pending,
      repoArg,
      attempt: pollAttempt,
      waitForCompletion,
      retry: (nextAttempt) =>
        verifyLatestCi(
          execFileSync,
          log,
          { headSha, repository: repo, waitForCompletion: true, runnerLabelsByJobName },
          nextAttempt,
          null,
        ),
    });
    if (retried) return retried;
  }
  throw createCiVerificationFailure(execFileSync, candidates, runs, headSha);
}
