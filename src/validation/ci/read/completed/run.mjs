import { evaluateJobPolicy } from "../../evaluate-job-policy.mjs";
import { readCiRun } from "../run.mjs";
import { validateJobRecords } from "../../validate/job-records.mjs";
import { buildCompletedRunResult } from "./run-result.mjs";

export function readCompletedRun(execFileSync, runId, headSha, runnerLabelsByJobName = {}) {
  const data = readCiRun(execFileSync, runId);
  if (!data || typeof data.status !== "string" || typeof data.conclusion !== "string")
    throw new Error(`GitHub Actions run ${runId} returned invalid final data.`);
  const jobs = validateJobRecords(data.jobs, runId);
  for (const job of jobs) job.labels = runnerLabelsByJobName[job.name] ?? [];
  const successful = (job) => job.status === "completed" && job.conclusion === "success";
  const policy = evaluateJobPolicy(jobs, successful);
  return buildCompletedRunResult(data, headSha, policy);
}
