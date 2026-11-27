import readWorktreeStatus from "../../repository/state/read-worktree-status.mjs";
import requireCleanWorktree from "../../repository/state/require-clean-worktree.mjs";

export default function collectPreflightContext(execFileSync) {
  const status = readWorktreeStatus(execFileSync);
  return { status, dirtyFailure: requireCleanWorktree(status) };
}
