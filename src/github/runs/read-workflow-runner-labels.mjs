import { parseJobs, parseWorkflow } from "../../repository/metadata/workflow-format.mjs";
import { jobValue } from "../../repository/metadata/workflow-job-rules.mjs";

function runnerValues(jobLines) {
  const index = jobLines.findIndex((line) => /^\s*runs-on\s*:/.test(line));
  if (index < 0) return null;
  const line = jobLines[index];
  const indent = line.length - line.trimStart().length;
  const value = line.trim().replace(/^runs-on\s*:\s*/, "");
  if (value) {
    const values =
      value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1).split(",") : [value];
    return values.map((item) => item.trim().replace(/^['"]|['"]$/g, ""));
  }
  const values = [];
  for (const next of jobLines.slice(index + 1)) {
    if (next.length - next.trimStart().length <= indent) break;
    const item = /^\s*-\s*(.+)$/.exec(next);
    if (!item) break;
    values.push(item[1].trim().replace(/^['"]|['"]$/g, ""));
  }
  return values;
}

function platformLabels(values) {
  const platforms = [];
  if (values.some((value) => /^ubuntu(?:-|$)/i.test(value))) platforms.push("ubuntu");
  if (values.some((value) => /^windows(?:-|$)/i.test(value))) platforms.push("windows");
  return platforms.length === 1 ? platforms : [];
}

export function parseWorkflowRunnerLabels(workflowText) {
  const sections = parseWorkflow(workflowText);
  const jobs = parseJobs(sections.get("jobs") ?? []);
  const labelsByName = Object.create(null);
  for (const [jobId, jobLines] of jobs) {
    const values = runnerValues(jobLines);
    if (values === null) continue;
    const labels = platformLabels(values);
    const displayName = (jobValue(jobLines, "name") ?? jobId).replaceAll(/["']/g, "");
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
