import { readWorkflowJobs } from "./jobs-reader.mjs";
import { mapWorkflowJobRunnerLabels } from "./mapper.mjs";

export function parseWorkflowRunnerLabels(workflowText) {
  return mapWorkflowJobRunnerLabels(readWorkflowJobs(workflowText));
}
