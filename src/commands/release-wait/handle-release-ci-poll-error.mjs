export async function handleReleaseCiPollError(error, poll, maxPolls, pollMs, sleep) {
  if (error instanceof SyntaxError) throw new Error(`Release CI returned malformed list JSON: ${error.message}`);
  if (poll + 1 >= maxPolls)
    throw new Error(`Release CI inspection failed after ${maxPolls} attempts: ${error.message}`);
  await sleep(pollMs);
}
