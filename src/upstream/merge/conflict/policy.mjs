export function isUpstreamMergeConflict(execFileSync) {
  try {
    const files = execFileSync("git", ["diff", "--name-only", "--diff-filter=U"], {
      encoding: "utf8",
    });
    return Boolean(String(files).trim());
  } catch {
    return false;
  }
}
