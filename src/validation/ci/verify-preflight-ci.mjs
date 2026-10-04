import { verifyLatestCi } from "./verify-exact-head.mjs";
import { readWorkflowRunnerLabels } from "../../github/runs/read-workflow-runner-labels.mjs";

export function verifyPreflightCi(execFileSync, log, status, fs = null) {
  if (status) return { passed: false, blocked: true };
  try {
    const headSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    return verifyLatestCi(execFileSync, log, {
      headSha,
      runnerLabelsByJobName: readWorkflowRunnerLabels(fs, ".github/workflows/ci.yaml"),
    });
  } catch (error) {
    return { passed: false, error };
  }
}
