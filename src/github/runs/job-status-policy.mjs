const acceptedConclusions = ["success", "skipped", "neutral"];

export function hasAcceptedWorkflowJobStatus(job) {
  return job.status === "completed" && acceptedConclusions.includes(job.conclusion);
}
