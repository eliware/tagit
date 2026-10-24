import { normalizeCompletedWorkflowJob } from "./status.mjs";
import { classifyReleaseJobPlatforms } from "./platforms.mjs";
import { enforceReleaseJobPolicy } from "./acceptance-policy.mjs";

export function verifyReleaseJobs(jobs, runnerLabelsByJobName = {}, workflowRun = {}) {
  const verifiedJobs = jobs.map((job) => normalizeCompletedWorkflowJob(job, workflowRun));
  const platforms = classifyReleaseJobPlatforms(verifiedJobs, runnerLabelsByJobName);
  return enforceReleaseJobPolicy(verifiedJobs, platforms);
}
