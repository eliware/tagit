export function reportUpstreamMergeConflict(execFileSync, log) {
  log.log("Merge conflicts detected. Resolve conflicts in these files:");
  execFileSync("git", ["diff", "--name-only", "--diff-filter=U"], { stdio: "inherit" });
}
