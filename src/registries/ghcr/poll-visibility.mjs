import { lookupGhcrVisibleImage } from "./verify/visibility-lookup.mjs";

export async function pollGhcrVisibility(
  execFile,
  log,
  { owner, imageName, version, retries, retryMs, sleep },
) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      log.info(`GHCR check ${attempt + 1}/${retries} for ${owner}/${imageName}:${version}.`);
      const image = await lookupGhcrVisibleImage(execFile, { owner, imageName, version });
      if (image) return image;
    } catch (error) {
      log.debug?.(`GHCR check ${attempt + 1}/${retries} failed: ${String(error).slice(0, 300)}`);
    }
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  throw new Error(`GHCR does not expose ${owner}/${imageName}:${version}.`);
}
