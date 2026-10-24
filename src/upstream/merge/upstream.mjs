import { reportUpstreamMergeConflict } from "./conflict-report.mjs";

export function mergeUpstream(execFileSync, upstreamBranch, message, log) {
  try {
    execFileSync("git", ["merge", upstreamBranch, "-m", message], { stdio: "inherit" });
  } catch {
    reportUpstreamMergeConflict(execFileSync, log);
    return false;
  }
  return true;
}
