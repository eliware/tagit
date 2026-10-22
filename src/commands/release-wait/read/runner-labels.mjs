import { readWorkflowRunnerLabelsFromGit } from "../../../github/runs/runner/label-reader.mjs";

export function readReleaseRunnerLabels(execFileSync, headSha, publication) {
  const workflowPaths = [
    ".github/workflows/ci.yaml",
    ...publication.workflows.map(({ workflowPath }) => workflowPath),
  ];
  return readWorkflowRunnerLabelsFromGit(execFileSync, headSha, workflowPaths);
}
