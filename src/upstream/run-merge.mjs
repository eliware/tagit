import { mergeMessage } from "./merge-message.mjs";
import { resolveUpstreamBranch } from "./branch.mjs";
import { parseUpstreamArguments } from "./parse-upstream-arguments.mjs";
import { mergeUpstream } from "./merge-upstream.mjs";

export function runUpstream(args, execFileSync, now, log) {
  const parsedArguments = parseUpstreamArguments(args);
  const dryRun = parsedArguments.includes("--dry-run");
  const message = mergeMessage(
    parsedArguments.filter((argument) => argument !== "--dry-run"),
    now,
  );
  if (dryRun) {
    const upstreamBranch = resolveUpstreamBranch(execFileSync);
    log.log(
      `Dry run: would fetch upstream, merge ${upstreamBranch} with message "${message}", then push.`,
    );
    return true;
  }
  execFileSync("git", ["fetch", "upstream"], { stdio: "inherit" });
  const upstreamBranch = resolveUpstreamBranch(execFileSync);
  if (!mergeUpstream(execFileSync, upstreamBranch, message, log)) return false;
  execFileSync("git", ["push"], { stdio: "inherit" });
  return true;
}
