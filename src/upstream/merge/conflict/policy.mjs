import readUpstreamMergeConflictFiles from "./files.mjs";

export default function isUpstreamMergeConflict(execFileSync) {
  const files = readUpstreamMergeConflictFiles(execFileSync);
  return Boolean(files && String(files).trim());
}
