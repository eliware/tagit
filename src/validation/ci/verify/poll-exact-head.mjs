import { pollPendingRun } from "../poll-pending-run.mjs";

export function pollExactHeadCi({
  execFileSync,
  log,
  pending,
  repoArg,
  attempt,
  waitForCompletion,
  retry,
}) {
  if (!waitForCompletion || !pollPendingRun(execFileSync, log, pending, repoArg, attempt))
    return false;
  return retry(attempt + 1);
}
