import { classifyRunnerPlatforms } from "../platforms.mjs";
import { readRunnerValues } from "../value-reader.mjs";

export function readWorkflowRunnerLabels(jobLines) {
  const values = readRunnerValues(jobLines);
  return values === null ? null : classifyRunnerPlatforms(values);
}
