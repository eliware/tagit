import { readWorkflowRunnerLabelsFromGit } from "../../github/runs/read-workflow-runner-labels.mjs";
import { resolveReleaseContext } from "./resolve-release-context.mjs";
import { validateReleaseInput } from "./validate-release-input.mjs";

export function prepareReleaseContext(execFileSync, options) {
  const { version, release, maxPolls, npmRetries, pollMs, npmRetryMs } = options;
  validateReleaseInput(version, release, maxPolls, npmRetries, pollMs, npmRetryMs);
  const context = resolveReleaseContext(execFileSync, version, release);
  const runnerLabelsByJobName = readWorkflowRunnerLabelsFromGit(execFileSync, context.headSha, [
    ".github/workflows/ci.yaml",
    ".github/workflows/publish.yaml",
  ]);
  return { ...context, runnerLabelsByJobName };
}
