import readWorkflowRunnerLabels from "../labels.mjs";
import resolveWorkflowJobName from "./identity.mjs";

export default function readWorkflowJobLabelEntries(jobs) {
  const entries = [];
  for (const [jobId, jobLines] of jobs) {
    const labels = readWorkflowRunnerLabels(jobLines);
    if (labels === null) continue;
    const displayName = resolveWorkflowJobName(jobId, jobLines);
    entries.push({ name: displayName, labels }, { name: jobId, labels });
  }
  return entries;
}
