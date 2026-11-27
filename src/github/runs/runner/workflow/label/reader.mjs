import readWorkflowJobs from "./jobs-reader.mjs";
import mapWorkflowJobRunnerLabels from "./mapper.mjs";

export default function parseWorkflowRunnerLabels(workflowText) {
  return mapWorkflowJobRunnerLabels(readWorkflowJobs(workflowText));
}
