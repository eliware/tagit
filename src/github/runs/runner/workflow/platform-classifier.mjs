import classifyRunnerPlatforms from "../platforms.mjs";

export default function classifyWorkflowRunnerValues(values) {
  return values === null ? null : classifyRunnerPlatforms(values);
}
