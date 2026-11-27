import jobValue from "../../../../../repository/metadata/workflow/job/value.mjs";

export default function resolveWorkflowJobName(jobId, jobLines) {
  return (jobValue(jobLines, "name") ?? jobId).replaceAll(/["']/g, "");
}
