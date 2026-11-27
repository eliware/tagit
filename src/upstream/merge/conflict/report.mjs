export default function reportUpstreamMergeConflict(log, files) {
  log.log("Merge conflicts detected. Resolve conflicts in these files:");
  log.log(String(files).trim());
}
