import runReleaseCiPollAttempt from "./poll/attempt.mjs";
import recoverReleaseCiPollError from "./poll/error/recovery.mjs";
import isCompleteReleaseCiPollResult from "./poll/result.mjs";

export default async function pollReleaseCi({
  execFile,
  repo,
  headSha,
  tag,
  pollMs,
  maxPolls,
  sleep,
  log,
  workflowPath = ".github/workflows/ci.yaml",
  workflowLabel = "CI",
  runnerLabelsByJobName = {},
}) {
  for (let poll = 0; poll < maxPolls; poll += 1) {
    try {
      log.info(`Release ${workflowLabel} check ${poll + 1}/${maxPolls} for ${repo}@${tag}.`);
      const result = await runReleaseCiPollAttempt({
        execFile,
        repo,
        headSha,
        tag,
        log,
        workflowPath,
        workflowLabel,
        runnerLabelsByJobName,
      });
      if (isCompleteReleaseCiPollResult(result)) return result;
    } catch (error) {
      const shouldRetry = await recoverReleaseCiPollError(error, poll, maxPolls, pollMs, sleep);
      if (!shouldRetry) throw error;
      continue;
    }
    if (poll + 1 < maxPolls) await sleep(pollMs);
  }
  throw new Error(`Release ${workflowLabel} did not complete for ${repo}@${tag} (${headSha})`);
}
