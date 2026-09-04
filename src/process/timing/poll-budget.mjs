export function validatePollBudget(maxPolls, npmRetries, pollMs, npmRetryMs) {
  if (![maxPolls, npmRetries].every(value => Number.isInteger(value) && value > 0) || ![pollMs, npmRetryMs].every(value => Number.isFinite(value) && value >= 0)) {
    throw new Error('Release verification polling bounds must be positive counts and non-negative delays.');
  }
}
