import { parseWorkflowRunnerLabels } from "../read-workflow-runner-labels.mjs";

export function readWorkflowRunnerLabels(fs, workflowPath) {
  if (!fs?.existsSync(workflowPath)) return {};
  return parseWorkflowRunnerLabels(fs.readFileSync(workflowPath, "utf8"));
}

export function readWorkflowRunnerLabelsFromGit(execFileSync, revision, workflowPaths) {
  const labelsByName = Object.create(null);
  for (const workflowPath of workflowPaths) {
    try {
      const content = execFileSync("git", ["show", `${revision}:${workflowPath}`], {
        encoding: "utf8",
      });
      Object.assign(labelsByName, parseWorkflowRunnerLabels(content));
    } catch {
      // Older/non-publishing repositories may not have every workflow path.
    }
  }
  return labelsByName;
}
