export function shouldNormalizeCompletedWorkflowJob(job, workflowRun) {
  if (workflowRun.status !== "completed") return false;
  if (workflowRun.conclusion !== "success") return false;
  return !(job.status === "completed" && job.conclusion !== null);
}
