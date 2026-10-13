import { parseJobs, parseWorkflow } from "../../repository/metadata/workflow-format.mjs";
import { jobValue } from "../../repository/metadata/workflow-job-rules.mjs";

export function parseWorkflowRunnerLabels(workflowText) {
  const sections = parseWorkflow(workflowText);
  const jobs = parseJobs(sections.get("jobs") ?? []);
  const labelsByName = Object.create(null);
  for (const [jobId, jobLines] of jobs) {
    const runnerValue = jobValue(jobLines, "runs-on");
    if (runnerValue === null) continue;
    const runner = runnerValue.replaceAll(/["']/g, "");
    const labels = /ubuntu/i.test(runner) ? ["ubuntu"] : /windows/i.test(runner) ? ["windows"] : [];
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
