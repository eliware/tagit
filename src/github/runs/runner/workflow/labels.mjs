import { classifyWorkflowRunnerValues } from "./platform-policy.mjs";
import { readRunnerValues } from "./values.mjs";

export function readWorkflowRunnerLabels(jobLines) {
  return classifyWorkflowRunnerValues(readRunnerValues(jobLines));
}
