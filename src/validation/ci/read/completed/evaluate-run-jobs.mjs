import { evaluateJobPolicy } from "../../evaluate-job-policy.mjs";
import { validateJobRecords } from "../../validate/job-records.mjs";

export function evaluateCompletedRunJobs(data, runId, runnerLabelsByJobName = {}) {
  const jobs = validateJobRecords(data.jobs, runId);
  for (const job of jobs) job.labels = runnerLabelsByJobName[job.name] ?? [];
  const successful = (job) => job.status === "completed" && job.conclusion === "success";
  return evaluateJobPolicy(jobs, successful);
}
