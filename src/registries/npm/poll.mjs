import { checkNpmPublicationAttempt } from "./poll-publication.mjs";

export async function pollNpmPublication(
  execFile,
  log,
  { command, packageName, version, retries, retryMs, sleep },
) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const available = await checkNpmPublicationAttempt(execFile, log, {
      command,
      packageName,
      version,
      attempt,
      retries,
    });
    if (available) return;
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  const message = `npm did not expose ${packageName}@${version} after ${retries} checks.`;
  log.info?.(message);
  throw new Error(message);
}
