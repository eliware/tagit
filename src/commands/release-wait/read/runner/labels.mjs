import { parseWorkflowRunnerLabelContents } from "../../../../github/runs/runner/workflow/label-reader.mjs";
import { readWorkflowContentsFromGit } from "../../../../github/runs/runner/workflow/reader.mjs";
import { selectReleaseRunnerWorkflowPaths } from "./workflow-paths.mjs";

export function readReleaseRunnerLabels(execFileSync, headSha, publication) {
  const workflowPaths = selectReleaseRunnerWorkflowPaths(publication);
  const contents = readWorkflowContentsFromGit(execFileSync, headSha, workflowPaths);
  return parseWorkflowRunnerLabelContents(contents);
}
