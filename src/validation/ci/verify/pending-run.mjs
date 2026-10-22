import { pollPendingRun } from "../poll-pending-run.mjs";

export function retryPendingRun(execFileSync, log, pending, repoArg, attempt, retry) {
  if (!pollPendingRun(execFileSync, log, pending, repoArg, attempt)) return false;
  return retry();
}
