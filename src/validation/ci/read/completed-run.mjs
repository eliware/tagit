import { evaluateJobPolicy } from "../evaluate-job-policy.mjs";
import { readCiRun } from "./run.mjs";
import { validateJobRecords } from "../validate/job-records.mjs";

export function readCompletedRun(execFileSync, runId, headSha, runnerLabelsByJobName = {}) {
  const data = readCiRun(execFileSync, runId);
  if (!data || typeof data.status !== "string" || typeof data.conclusion !== "string")
    throw new Error(`GitHub Actions run ${runId} returned invalid final data.`);
  const jobs = validateJobRecords(data.jobs, runId);
  for (const job of jobs) job.labels = runnerLabelsByJobName[job.name] ?? [];
  const successful = (job) => job.status === "completed" && job.conclusion === "success";
  const policy = evaluateJobPolicy(jobs, successful);
  return {
    passed:
      !policy.failed &&
      data.status === "completed" &&
      data.conclusion === "success" &&
      data.headSha === headSha &&
      policy.ubuntu &&
      policy.windows.passed,
    platforms: policy.windows.successful ? "Ubuntu and Windows passed" : "Ubuntu passed",
    policy,
  };
}
