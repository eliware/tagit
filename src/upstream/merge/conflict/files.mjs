export function readUpstreamMergeConflictFiles(execFileSync) {
  try {
    return execFileSync("git", ["diff", "--name-only", "--diff-filter=U"], {
      encoding: "utf8",
    });
  } catch {
    return null;
  }
}
