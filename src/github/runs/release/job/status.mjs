export function normalizeCompletedWorkflowJob(job, workflowRun) {
  if (workflowRun.status !== "completed") return job;
  if (workflowRun.conclusion !== "success") return job;
  if (job.status === "completed" && job.conclusion !== null) return job;
  if (!Array.isArray(job.steps)) return job;
  if (job.steps.length === 0) return job;
  if (!job.steps.every((step) => step.status === "completed" && step.conclusion === "success"))
    return job;
  return { ...job, status: "completed", conclusion: "success" };
}
