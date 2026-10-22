import { resolveUpstreamBranch } from "./branch.mjs";
import { readUpstreamMergeInput } from "./merge/input.mjs";
import { mergeUpstream } from "./merge/upstream.mjs";
import { reportUpstreamDryRun } from "./merge/dry-run.mjs";

export function runUpstream(args, execFileSync, now, log) {
  const { dryRun, message } = readUpstreamMergeInput(args, now);
  if (dryRun) {
    const upstreamBranch = resolveUpstreamBranch(execFileSync);
    reportUpstreamDryRun(log, upstreamBranch, message);
    return true;
  }
  execFileSync("git", ["fetch", "upstream"], { stdio: "inherit" });
  const upstreamBranch = resolveUpstreamBranch(execFileSync);
  if (!mergeUpstream(execFileSync, upstreamBranch, message, log)) return false;
  execFileSync("git", ["push"], { stdio: "inherit" });
  return true;
}
