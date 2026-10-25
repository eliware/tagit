import { classifyRunnerPlatforms } from "../platforms.mjs";

export function classifyWorkflowRunnerValues(values) {
  return values === null ? null : classifyRunnerPlatforms(values);
}
