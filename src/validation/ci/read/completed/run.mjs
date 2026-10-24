import { readCiRun } from "../run.mjs";
import { buildCompletedRunResult } from "./run-result.mjs";
import { evaluateCompletedRunJobs } from "./evaluate-run-jobs.mjs";

export function readCompletedRun(execFileSync, runId, headSha, runnerLabelsByJobName = {}) {
  const data = readCiRun(execFileSync, runId);
  if (!data || typeof data.status !== "string" || typeof data.conclusion !== "string")
    throw new Error(`GitHub Actions run ${runId} returned invalid final data.`);
  const policy = evaluateCompletedRunJobs(data, runId, runnerLabelsByJobName);
  return buildCompletedRunResult(data, headSha, policy);
}
