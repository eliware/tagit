import { publishesGhcr } from "../../../registries/ghcr/discover-publication.mjs";
import { verifyNpmRegistry } from "./registries/npm.mjs";
import { verifyGhcrRegistry } from "./registries/ghcr.mjs";

export async function verifyRegistries({
  fs,
  execFile,
  log,
  repo,
  version,
  release,
  applicable,
  packageName,
  isPrivate,
  maxPolls,
  npmRetries,
  pollMs,
  npmRetryMs,
  sleep,
}) {
  const npm = Boolean(applicable && packageName && !isPrivate);
  if (npm) {
    await verifyNpmRegistry({
      execFile,
      log,
      packageName,
      version,
      retries: npmRetries,
      retryMs: npmRetryMs,
      sleep,
    });
  } else log.info("npm verification: not applicable.");
  if (publishesGhcr(fs)) {
    const { imageDigest } = await verifyGhcrRegistry({
      execFile,
      log,
      repo,
      version,
      retries: maxPolls,
      retryMs: pollMs,
      release,
      sleep,
    });
    return { npm, ghcr: true, imageDigest };
  }
  log.info("GHCR verification: not applicable.");
  return { npm, ghcr: false };
}
