export function requireCleanWorktree(status) {
  return status
    ? `BLOCKED: uncommitted changes are present:\n${status}\nAction: commit and push these changes, wait for CI to pass on the new commit, then rerun tagit preflight.`
    : null;
}
