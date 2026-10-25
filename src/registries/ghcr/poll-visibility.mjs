import { readGhcrVisibilityAttempt } from "./poll/attempt.mjs";

export async function pollGhcrVisibility(
  execFile,
  log,
  { owner, imageName, version, retries, retryMs, sleep, onVisible = (image) => image },
) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const image = await readGhcrVisibilityAttempt(execFile, log, {
      owner,
      imageName,
      version,
      attempt,
      retries,
    });
    if (image) return onVisible(image);
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  throw new Error(`GHCR does not expose ${owner}/${imageName}:${version}.`);
}
