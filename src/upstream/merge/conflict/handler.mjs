import readUpstreamMergeConflictFiles from "./files.mjs";
import reportUpstreamMergeConflict from "./report.mjs";

export default function handleUpstreamMergeConflict(execFileSync, log) {
  const files = readUpstreamMergeConflictFiles(execFileSync);
  if (!files || !String(files).trim()) return false;
  reportUpstreamMergeConflict(log, files);
  return true;
}
