export function readUpstreamMergeConflictFiles(execFileSync) {
  return execFileSync("git", ["diff", "--name-only", "--diff-filter=U"], {
    encoding: "utf8",
  });
}
