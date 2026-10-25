import { evaluateJobPolicy } from "../../evaluate-job-policy.mjs";
import { validateJobRecords } from "../../validate/job-records.mjs";
import { addCompletedRunRunnerLabels } from "./runner-labels.mjs";

export function evaluateCompletedRunJobs(data, runId, runnerLabelsByJobName = {}) {
  const jobs = addCompletedRunRunnerLabels(
    validateJobRecords(data.jobs, runId),
    runnerLabelsByJobName,
  );
  const successful = (job) => job.status === "completed" && job.conclusion === "success";
  return evaluateJobPolicy(jobs, successful);
}
