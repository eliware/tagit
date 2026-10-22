import { shouldNormalizeCompletedWorkflowJob } from "./normalization-policy.mjs";

export function normalizeCompletedWorkflowJob(job, workflowRun) {
  if (!shouldNormalizeCompletedWorkflowJob(job, workflowRun)) return job;
  if (!Array.isArray(job.steps)) return job;
  if (job.steps.length === 0) return job;
  if (!job.steps.every((step) => step.status === "completed" && step.conclusion === "success"))
    return job;
  return { ...job, status: "completed", conclusion: "success" };
}
