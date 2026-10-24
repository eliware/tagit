import { handleUpstreamDryRun } from "./merge/command-policy.mjs";
import { executeUpstreamMerge } from "./merge/execute.mjs";
import { prepareUpstreamMerge } from "./merge/prepare.mjs";

export function runUpstream(args, execFileSync, now, log) {
  const { dryRun, message } = prepareUpstreamMerge(args, now);
  if (handleUpstreamDryRun(execFileSync, log, dryRun, message)) return true;
  return executeUpstreamMerge(execFileSync, message, log);
}
