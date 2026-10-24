import { handleReleaseCiPollError } from "./policy.mjs";

export async function recoverReleaseCiPollError(error, poll, maxPolls, pollMs, sleep) {
  if (error.code === "ERR_RELEASE_CI_FAILED") return false;
  await handleReleaseCiPollError(error, poll, maxPolls, pollMs, sleep);
  return true;
}
