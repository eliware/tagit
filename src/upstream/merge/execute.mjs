import { resolveUpstreamBranch } from "../branch.mjs";
import { mergeUpstream } from "./upstream.mjs";

export function executeUpstreamMerge(execFileSync, message, log) {
  execFileSync("git", ["fetch", "upstream"], { stdio: "inherit" });
  const upstreamBranch = resolveUpstreamBranch(execFileSync);
  if (!mergeUpstream(execFileSync, upstreamBranch, message, log)) return false;
  execFileSync("git", ["push"], { stdio: "inherit" });
  return true;
}
