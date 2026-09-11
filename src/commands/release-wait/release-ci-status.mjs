import { runReleaseCiPollAttempt } from './release-ci-poll-attempt.mjs';
import { handleReleaseCiPollError } from './handle-release-ci-poll-error.mjs';

export async function pollReleaseCi({ execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly, log }) {
  for (let poll = 0; poll < maxPolls; poll += 1) {
    try {
      const result = await runReleaseCiPollAttempt({ execFile, repo, headSha, tag, linksOnly, log });
      if (result && !result.pending) return result;
    } catch (error) {
      await handleReleaseCiPollError(error, poll, maxPolls, pollMs, sleep);
      continue;
    }
    if (poll + 1 < maxPolls) await sleep(pollMs);
  }
  throw new Error(`Release CI did not complete for ${repo}@${tag} (${headSha})`);
}
