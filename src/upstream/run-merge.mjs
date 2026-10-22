import { mergeMessage } from "./merge/message/build.mjs";
import { resolveUpstreamBranch } from "./branch.mjs";
import { parseUpstreamArguments } from "./merge/parse-arguments.mjs";
import { mergeUpstream } from "./merge/upstream.mjs";
import { reportUpstreamDryRun } from "./merge/dry-run.mjs";

export function runUpstream(args, execFileSync, now, log) {
  const { dryRun, messageArguments } = parseUpstreamArguments(args);
  const message = mergeMessage(messageArguments, now);
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
