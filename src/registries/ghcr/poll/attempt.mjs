import { lookupGhcrVisibleImage } from "../verify/visibility-lookup.mjs";

export async function readGhcrVisibilityAttempt(
  execFile,
  log,
  { owner, imageName, version, attempt, retries },
) {
  log.info(`GHCR check ${attempt + 1}/${retries} for ${owner}/${imageName}:${version}.`);
  try {
    return await lookupGhcrVisibleImage(execFile, { owner, imageName, version });
  } catch (error) {
    log.debug?.(`GHCR check ${attempt + 1}/${retries} failed: ${String(error).slice(0, 300)}`);
    return null;
  }
}
