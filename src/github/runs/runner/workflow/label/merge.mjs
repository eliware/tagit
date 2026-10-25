export function mergeWorkflowRunnerLabelEntries(entries) {
  const labelsByName = Object.create(null);
  const conflicts = new Set();
  for (const { name, labels } of entries) {
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
  return labelsByName;
}
