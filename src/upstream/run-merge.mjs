import { mergeMessage } from "./merge/message/build.mjs";
import { parseUpstreamArguments } from "./merge/parse-arguments.mjs";
import { handleUpstreamDryRun } from "./merge/command-policy.mjs";
import { executeUpstreamMerge } from "./merge/execute.mjs";

export function runUpstream(args, execFileSync, now, log) {
  const { dryRun, messageArguments } = parseUpstreamArguments(args);
  const message = mergeMessage(messageArguments, now);
  if (handleUpstreamDryRun(execFileSync, log, dryRun, message)) return true;
  return executeUpstreamMerge(execFileSync, message, log);
}
