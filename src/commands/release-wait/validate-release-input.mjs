import { validatePollBudget } from '../../process/timing/poll-budget.mjs';

export function validateReleaseInput(version, release, maxPolls, npmRetries, pollMs, npmRetryMs) {
  if (!/^\d+\.\d+\.\d+$/.test(version ?? '') || !/^[0-9a-f]{3,64}$/i.test(release?.commitSha ?? ''))
    throw new Error('Release version and commit SHA are required and must be valid.');
  validatePollBudget(maxPolls, npmRetries, pollMs, npmRetryMs);
}
