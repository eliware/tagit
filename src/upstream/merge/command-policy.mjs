import resolveUpstreamBranch from "./resolve-branch.mjs";
import reportUpstreamDryRun from "./dry/run.mjs";

export default function handleUpstreamDryRun(execFileSync, log, dryRun, message) {
  if (!dryRun) return false;
  const upstreamBranch = resolveUpstreamBranch(execFileSync);
  reportUpstreamDryRun(log, upstreamBranch, message);
  return true;
}
