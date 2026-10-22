import { readWorkflowRunnerLabelsFromGit } from "../../github/runs/read-workflow-runner-labels.mjs";
import { readPublicationTarget } from "./read/publication-target.mjs";
import { resolveReleaseContext } from "./resolve/release-context.mjs";
import { validateReleaseInput } from "./validate-release/input.mjs";

export function prepareReleaseContext(execFileSync, fs, options) {
  const { version, release, maxPolls, npmRetries, pollMs, npmRetryMs } = options;
  validateReleaseInput(version, release, maxPolls, npmRetries, pollMs, npmRetryMs);
  const context = resolveReleaseContext(execFileSync, version, release);
  const publication = readPublicationTarget(fs);
  const runnerLabelsByJobName = readWorkflowRunnerLabelsFromGit(execFileSync, context.headSha, [
    ".github/workflows/ci.yaml",
    ...publication.workflows.map(({ workflowPath }) => workflowPath),
  ]);
  return { ...context, publication, runnerLabelsByJobName };
}
