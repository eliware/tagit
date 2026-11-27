import parseWorkflowRunnerLabels from "./workflow/label/reader.mjs";

export default function readWorkflowRunnerLabelsFile(fs, workflowPath) {
  if (!fs?.existsSync(workflowPath)) return {};
  return parseWorkflowRunnerLabels(fs.readFileSync(workflowPath, "utf8"));
}
