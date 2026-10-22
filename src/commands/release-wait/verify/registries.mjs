import { verifyNpmRegistry } from "./registries/npm.mjs";
import { verifyGhcrRegistryIfApplicable } from "./ghcr-registry.mjs";

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
  const ghcr = await verifyGhcrRegistryIfApplicable(fs, {
    execFile,
    log,
    repo,
    version,
    retries: maxPolls,
    retryMs: pollMs,
    release,
    sleep,
  });
  if (!ghcr.ghcr) log.info("GHCR verification: not applicable.");
  return { npm, ...ghcr };
}
