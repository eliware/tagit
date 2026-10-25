import { handleUpstreamMergeConflict } from "./conflict/handler.mjs";

export function mergeUpstream(execFileSync, upstreamBranch, message, log) {
  try {
    execFileSync("git", ["merge", upstreamBranch, "-m", message], { stdio: "inherit" });
  } catch (error) {
    if (!handleUpstreamMergeConflict(execFileSync, log)) throw error;
    return false;
  }
  return true;
}
