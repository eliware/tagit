import { normalizeCompletedWorkflowJob } from "./status.mjs";
import { classifyJobsByPlatform } from "../../runner/job-platforms.mjs";
import { addWorkflowRunnerLabels } from "./workflow-labels.mjs";
import { enforceReleaseJobPolicy } from "./acceptance-policy.mjs";

export function verifyReleaseJobs(jobs, runnerLabelsByJobName = {}, workflowRun = {}) {
  const verifiedJobs = jobs.map((job) => normalizeCompletedWorkflowJob(job, workflowRun));
  const jobsWithLabels = addWorkflowRunnerLabels(verifiedJobs, runnerLabelsByJobName);
  const platforms = classifyJobsByPlatform(jobsWithLabels);
  return enforceReleaseJobPolicy(jobsWithLabels, platforms);
}
