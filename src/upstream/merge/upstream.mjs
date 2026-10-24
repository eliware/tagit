import { reportUpstreamMergeConflict } from "./conflict/report.mjs";
import { isUpstreamMergeConflict } from "./conflict/policy.mjs";

export function mergeUpstream(execFileSync, upstreamBranch, message, log) {
  try {
    execFileSync("git", ["merge", upstreamBranch, "-m", message], { stdio: "inherit" });
  } catch (error) {
    if (!isUpstreamMergeConflict(execFileSync)) throw error;
    reportUpstreamMergeConflict(execFileSync, log);
    return false;
  }
  return true;
}
