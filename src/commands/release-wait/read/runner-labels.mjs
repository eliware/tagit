import { parseWorkflowRunnerLabels } from "../../../github/runs/read-workflow-runner-labels.mjs";
import { readWorkflowContentsFromGit } from "../../../github/runs/runner/workflow-reader.mjs";

export function readReleaseRunnerLabels(execFileSync, headSha, publication) {
  const workflowPaths = [
    ".github/workflows/ci.yaml",
    ...publication.workflows.map(({ workflowPath }) => workflowPath),
  ];
  const contents = readWorkflowContentsFromGit(execFileSync, headSha, workflowPaths);
  const labelsByName = Object.create(null);
  for (const content of Object.values(contents))
    Object.assign(labelsByName, parseWorkflowRunnerLabels(content));
  return labelsByName;
}
