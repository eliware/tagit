const acceptedConclusions = ["success", "skipped", "neutral"];

export default function hasAcceptedWorkflowJobStatus(job) {
  return job.status === "completed" && acceptedConclusions.includes(job.conclusion);
}
