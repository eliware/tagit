export function parseWorkflowRunnerLabels(workflowText) {
  const lines = workflowText.split(/\r?\n/);
  const jobsIndex = lines.findIndex((line) => line.trim() === "jobs:");
  if (jobsIndex < 0) return {};
  const labelsByName = {};
  for (let index = jobsIndex + 1; index < lines.length; index += 1) {
    if (!/^  [A-Za-z0-9_-]+:\s*$/.test(lines[index])) continue;
    const jobId = lines[index].trim().slice(0, -1);
    const end = lines.findIndex(
      (line, candidate) => candidate > index && /^  [A-Za-z0-9_-]+:\s*$/.test(line),
    );
    const jobLines = lines.slice(index + 1, end < 0 ? undefined : end);
    const nameLine = jobLines.find((line) => /^    name:\s*/.test(line));
    const runnerLine = jobLines.find((line) => /^    runs-on:\s*/.test(line));
    if (!runnerLine) continue;
    const runner = runnerLine.replace(/^    runs-on:\s*/, "").replaceAll(/["']/g, "");
    const labels = /ubuntu/i.test(runner) ? ["ubuntu"] : /windows/i.test(runner) ? ["windows"] : [];
    const displayName = nameLine?.replace(/^    name:\s*/, "").replaceAll(/["']/g, "") ?? jobId;
    labelsByName[displayName] = labels;
    labelsByName[jobId] = labels;
  }
  return labelsByName;
}

export function readWorkflowRunnerLabels(fs, workflowPath) {
  if (!fs?.existsSync(workflowPath)) return {};
  return parseWorkflowRunnerLabels(fs.readFileSync(workflowPath, "utf8"));
}

export function readWorkflowRunnerLabelsFromGit(execFileSync, revision, workflowPaths) {
  const labelsByName = {};
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
