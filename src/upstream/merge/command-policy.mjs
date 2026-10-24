import { resolveUpstreamBranch } from "../branch.mjs";
import { reportUpstreamDryRun } from "./dry/run.mjs";

export function handleUpstreamDryRun(execFileSync, log, dryRun, message) {
  if (!dryRun) return false;
  const upstreamBranch = resolveUpstreamBranch(execFileSync);
  reportUpstreamDryRun(log, upstreamBranch, message);
  return true;
}
