import { pushExistingCommits } from "./existing-commits.mjs";
import { reportPushResult } from "./report-result.mjs";

export function runPushCommand({ execFileSync, reportCiLinks, log, exit, dryRun }) {
  if (dryRun) {
    log.info("Dry run: no commits were pushed and no CI lookup was performed.");
    return;
  }
  try {
    pushExistingCommits(execFileSync);
    reportPushResult(execFileSync, reportCiLinks, log);
  } catch (error) {
    log.error(error);
    exit(1);
    throw error;
  }
}
