import { parseJobs } from "../../../../../repository/metadata/workflow/jobs-parser.mjs";
import { parseWorkflow } from "../../../../../repository/metadata/workflow/parser.mjs";

export function readWorkflowJobs(workflowText) {
  const sections = parseWorkflow(workflowText);
  return parseJobs(sections.get("jobs") ?? []);
}
