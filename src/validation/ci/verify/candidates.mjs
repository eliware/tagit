import { verifyCompletedRun } from "./completed-run.mjs";

export function verifyCiCandidates(
  execFileSync,
  log,
  candidates,
  headSha,
  runnerLabelsByJobName,
  verifyRun = verifyCompletedRun,
) {
  for (const run of candidates) {
    const result = verifyRun(execFileSync, log, run, headSha, runnerLabelsByJobName);
    if (result) return result;
  }
  return null;
}
