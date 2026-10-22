import { verifyGhcrPublication } from "../../../../registries/ghcr/verify/publication.mjs";

export async function verifyGhcrRegistry({
  execFile,
  log,
  repo,
  version,
  release,
  retries,
  retryMs,
  sleep,
}) {
  log.info(`Checking GHCR publication for ${repo}:${version}.`);
  const { imageDigest } = await verifyGhcrPublication(execFile, log, {
    repository: repo,
    version,
    expectedDigest: release.imageDigest ?? null,
    retries,
    retryMs,
    sleep,
  });
  return { imageDigest };
}
