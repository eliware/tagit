import { mergeMessage } from "./merge/message.mjs";
import { resolveUpstreamBranch } from "./branch.mjs";
import { parseUpstreamArguments } from "./parse-upstream-arguments.mjs";
import { mergeUpstream } from "./merge/upstream.mjs";

export function runUpstream(args, execFileSync, now, log) {
  const { dryRun, messageArguments } = parseUpstreamArguments(args);
  const message = mergeMessage(messageArguments, now);
  if (dryRun) {
    const upstreamBranch = resolveUpstreamBranch(execFileSync);
    log.log(
      `Dry run: can fetch upstream, merge ${upstreamBranch} with message "${message}", then push.`,
    );
    return true;
  }
  execFileSync("git", ["fetch", "upstream"], { stdio: "inherit" });
  const upstreamBranch = resolveUpstreamBranch(execFileSync);
  if (!mergeUpstream(execFileSync, upstreamBranch, message, log)) return false;
  execFileSync("git", ["push"], { stdio: "inherit" });
  return true;
}
