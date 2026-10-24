import { parseJobs, parseWorkflow } from "../../../../repository/metadata/workflow/parser.mjs";
import { jobValue } from "../../../../repository/metadata/workflow/job-rules.mjs";
import { readWorkflowRunnerLabels } from "./labels.mjs";

export function parseWorkflowRunnerLabels(workflowText) {
  const sections = parseWorkflow(workflowText);
  const jobs = parseJobs(sections.get("jobs") ?? []);
  const labelsByName = Object.create(null);
  for (const [jobId, jobLines] of jobs) {
    const labels = readWorkflowRunnerLabels(jobLines);
    if (labels === null) continue;
    const displayName = (jobValue(jobLines, "name") ?? jobId).replaceAll(/["']/g, "");
    labelsByName[displayName] = labels;
    labelsByName[jobId] = labels;
  }
  return labelsByName;
}

export function parseWorkflowRunnerLabelContents(contentsByPath) {
  const labelsByName = Object.create(null);
  for (const content of Object.values(contentsByPath))
    Object.assign(labelsByName, parseWorkflowRunnerLabels(content));
  return labelsByName;
}
