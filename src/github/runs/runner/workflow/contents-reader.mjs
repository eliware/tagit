import { parseWorkflowRunnerLabels } from "./label-reader.mjs";

export function parseWorkflowRunnerLabelContents(contentsByPath) {
  const labelsByName = Object.create(null);
  for (const content of Object.values(contentsByPath))
    Object.assign(labelsByName, parseWorkflowRunnerLabels(content));
  return labelsByName;
}
