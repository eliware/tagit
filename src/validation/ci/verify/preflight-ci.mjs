import { verifyLatestCi } from "./exact-head.mjs";
import { readWorkflowRunnerLabelsFile } from "../../../github/runs/runner/file-reader.mjs";

export function verifyPreflightCi(execFileSync, log, status, fs = null) {
  if (status) return { passed: false, blocked: true };
  try {
    const headSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    return verifyLatestCi(execFileSync, log, {
      headSha,
      runnerLabelsByJobName: readWorkflowRunnerLabelsFile(fs, ".github/workflows/ci.yaml"),
    });
  } catch (error) {
    return { passed: false, error };
  }
}
