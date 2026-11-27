import isUpstreamMergeConflict from "./policy.mjs";
import reportUpstreamMergeConflict from "./report.mjs";

export default function handleUpstreamMergeConflict(execFileSync, log) {
  if (!isUpstreamMergeConflict(execFileSync)) return false;
  reportUpstreamMergeConflict(execFileSync, log);
  return true;
}
