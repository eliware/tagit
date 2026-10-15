import { runReleaseCiPollAttempt } from "./release-ci-poll-attempt.mjs";
import { handleReleaseCiPollError } from "./handle-release-ci-poll-error.mjs";

export async function pollReleaseCi({
  execFile,
  repo,
  headSha,
  tag,
  pollMs,
  maxPolls,
  sleep,
  linksOnly,
  log,
  workflowPath = ".github/workflows/ci.yaml",
  workflowLabel = "CI",
}) {
  for (let poll = 0; poll < maxPolls; poll += 1) {
    try {
      log.info(`Release ${workflowLabel} check ${poll + 1}/${maxPolls} for ${repo}@${tag}.`);
      const result = await runReleaseCiPollAttempt({
        execFile,
        repo,
        headSha,
        tag,
        linksOnly,
        log,
        workflowPath,
        workflowLabel,
      });
      if (result && !result.pending) return result;
    } catch (error) {
      if (error.code === "ERR_RELEASE_CI_FAILED") throw error;
      await handleReleaseCiPollError(error, poll, maxPolls, pollMs, sleep);
      continue;
    }
    if (poll + 1 < maxPolls) await sleep(pollMs);
  }
  throw new Error(`Release ${workflowLabel} did not complete for ${repo}@${tag} (${headSha})`);
}
