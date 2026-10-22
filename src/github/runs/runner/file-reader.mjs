import { parseWorkflowRunnerLabels } from "./workflow/label-reader.mjs";

export function readWorkflowRunnerLabelsFile(fs, workflowPath) {
  if (!fs?.existsSync(workflowPath)) return {};
  return parseWorkflowRunnerLabels(fs.readFileSync(workflowPath, "utf8"));
}
