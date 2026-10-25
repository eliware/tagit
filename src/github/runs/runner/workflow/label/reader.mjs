import { parseJobs, parseWorkflow } from "../../../../../repository/metadata/workflow/parser.mjs";
import { mapWorkflowJobRunnerLabels } from "./mapper.mjs";

export function parseWorkflowRunnerLabels(workflowText) {
  const sections = parseWorkflow(workflowText);
  const jobs = parseJobs(sections.get("jobs") ?? []);
  return mapWorkflowJobRunnerLabels(jobs);
}
