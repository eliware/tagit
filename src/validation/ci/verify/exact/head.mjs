import verifyCiCandidates from "../candidates.mjs";
import readExactHeadRuns from "../../read/exact-head/runs.mjs";
import selectExactHeadEvidence from "./head/evidence.mjs";
import retryExactHeadCi from "./head/retry.mjs";
import createCiVerificationFailure from "../result-policy.mjs";
import readRepositoryName from "../../../../repository/repository-name/read-repository-name.mjs";

export default function verifyLatestCi(
  execFileSync,
  log,
  { headSha, repository = null, waitForCompletion = true, runnerLabelsByJobName = {} } = {},
  pollAttempt = 0,
  selectedRun = null,
) {
  if (!headSha) throw new Error("A commit SHA is required for CI verification.");
  const repo = repository ?? readRepositoryName(execFileSync);
  const { repoArg, runs } = readExactHeadRuns(execFileSync, headSha, repo, selectedRun);
  const { candidates, pending } = selectExactHeadEvidence(runs, headSha);
  const result = verifyCiCandidates(execFileSync, log, candidates, headSha, runnerLabelsByJobName);
  if (result) return result;
  const retried = retryExactHeadCi(
    {
      execFileSync,
      log,
      pending,
      repoArg,
      attempt: pollAttempt,
      waitForCompletion,
      headSha,
      repository: repo,
      runnerLabelsByJobName,
    },
    verifyLatestCi,
  );
  if (retried) return retried;
  throw createCiVerificationFailure(execFileSync, candidates, runs, headSha);
}
