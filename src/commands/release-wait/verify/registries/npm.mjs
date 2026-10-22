import { verifyNpmPublication } from "../../../../registries/npm/verify-publication.mjs";

export async function verifyNpmRegistry({
  execFile,
  log,
  packageName,
  version,
  retries,
  retryMs,
  sleep,
}) {
  log.info(`Checking npm publication for ${packageName}@${version}.`);
  await verifyNpmPublication(execFile, log, { packageName, version, retries, retryMs, sleep });
  log.info(`npm verified: ${packageName}@${version}.`);
}
