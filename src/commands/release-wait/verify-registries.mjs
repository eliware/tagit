import { publishesGhcr } from '../../registries/ghcr/discover-publication.mjs';
import { verifyNpmPublication } from '../../registries/npm/verify-publication.mjs';
import { verifyGhcrPublication } from '../../registries/ghcr/verify-publication.mjs';

export async function verifyRegistries({ fs, execFile, log, repo, version, release, packageName, isPrivate, maxPolls, npmRetries, pollMs, npmRetryMs, sleep }) {
  const npm = Boolean(packageName && !isPrivate);
  if (npm) { await verifyNpmPublication(execFile, log, { packageName, version, retries: npmRetries, retryMs: npmRetryMs, sleep }); log.info(`npm verified: ${packageName}@${version}.`); } else log.info('npm verification: not applicable.');
  if (publishesGhcr(fs)) {
    const { imageDigest } = await verifyGhcrPublication(execFile, log, { repository: repo, version, expectedDigest: release.imageDigest ?? null, retries: maxPolls, retryMs: pollMs, sleep });
    return { npm, ghcr: true, imageDigest };
  }
  log.info('GHCR verification: not applicable.');
  return { npm, ghcr: false };
}
