import { parseJobs } from "../../../../repository/metadata/workflow/jobs.mjs";
import { parseWorkflow } from "../../../../repository/metadata/workflow/sections.mjs";
import { jobValue } from "../../../../repository/metadata/workflow/job-rules.mjs";
import { classifyRunnerPlatforms } from "../platforms.mjs";
import { readRunnerValues } from "../value-reader.mjs";

export function parseWorkflowRunnerLabels(workflowText) {
  const sections = parseWorkflow(workflowText);
  const jobs = parseJobs(sections.get("jobs") ?? []);
  const labelsByName = Object.create(null);
  for (const [jobId, jobLines] of jobs) {
    const values = readRunnerValues(jobLines);
    if (values === null) continue;
    const labels = classifyRunnerPlatforms(values);
    const displayName = (jobValue(jobLines, "name") ?? jobId).replaceAll(/["']/g, "");
    labelsByName[displayName] = labels;
    labelsByName[jobId] = labels;
  }
  return labelsByName;
}
