import { jobValue } from "../../../../../repository/metadata/workflow/job-rules.mjs";
import { readWorkflowRunnerLabels } from "../labels.mjs";

export function readWorkflowJobLabelEntries(jobs) {
  const entries = [];
  for (const [jobId, jobLines] of jobs) {
    const labels = readWorkflowRunnerLabels(jobLines);
    if (labels === null) continue;
    const displayName = (jobValue(jobLines, "name") ?? jobId).replaceAll(/["']/g, "");
    entries.push({ name: displayName, labels }, { name: jobId, labels });
  }
  return entries;
}
