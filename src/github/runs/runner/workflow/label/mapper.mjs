import { jobValue } from "../../../../../repository/metadata/workflow/job-rules.mjs";
import { readWorkflowRunnerLabels } from "../labels.mjs";

export function mapWorkflowJobRunnerLabels(jobs) {
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
