import { parseWorkflowRunnerLabels } from "./label/reader.mjs";
import { mergeWorkflowRunnerLabelEntries } from "./label/merge.mjs";

export function parseWorkflowRunnerLabelContents(contentsByPath) {
  const entries = [];
  for (const content of Object.values(contentsByPath)) {
    const workflowLabels = parseWorkflowRunnerLabels(content);
    entries.push(...Object.entries(workflowLabels).map(([name, labels]) => ({ name, labels })));
  }
  return mergeWorkflowRunnerLabelEntries(entries);
}
