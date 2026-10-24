import { readCompletedRun } from "../read/completed/run.mjs";

export function verifyCompletedRun(execFileSync, log, run, headSha, runnerLabelsByJobName = {}) {
  const result = readCompletedRun(execFileSync, run.databaseId, headSha, runnerLabelsByJobName);
  if (result.passed) {
    log.info(`GitHub Actions CI verified for ${headSha}: ${result.platforms}.`);
    return {
      runId: run.databaseId,
      headSha,
      ubuntu: true,
      ...(result.policy.windows.successful ? { windows: true } : {}),
    };
  }
  return null;
}
