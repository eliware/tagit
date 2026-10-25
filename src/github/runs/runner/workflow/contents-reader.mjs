import { parseWorkflowRunnerLabels } from "./label/reader.mjs";

export function parseWorkflowRunnerLabelContents(contentsByPath) {
  const labelsByName = Object.create(null);
  const conflicts = new Set();
  for (const content of Object.values(contentsByPath)) {
    const workflowLabels = parseWorkflowRunnerLabels(content);
    for (const [name, labels] of Object.entries(workflowLabels)) {
      if (conflicts.has(name)) continue;
      if (!Object.hasOwn(labelsByName, name)) {
        labelsByName[name] = labels;
        continue;
      }
      if (JSON.stringify(labelsByName[name]) !== JSON.stringify(labels)) {
        labelsByName[name] = [];
        conflicts.add(name);
      }
    }
  }
  return labelsByName;
}
