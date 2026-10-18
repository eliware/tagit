export function requireCleanWorktree(status) {
  return status
    ? `BLOCKED: uncommitted changes exist:\n${status}\nAction: commit and push these changes, wait for CI on the new commit, then rerun tagit preflight.`
    : null;
}
