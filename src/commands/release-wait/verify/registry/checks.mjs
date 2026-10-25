import { verifyNpmRegistry } from "../registries/npm-check.mjs";
import { verifyRegistryGhcrCheck } from "./ghcr-check.mjs";

export async function verifyRegistryChecks({
  fs,
  execFile,
  log,
  repo,
  version,
  release,
  packageName,
  npm,
  ghcr,
  maxPolls,
  npmRetries,
  pollMs,
  npmRetryMs,
  sleep,
}) {
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
  }
  const ghcrResult = await verifyRegistryGhcrCheck({
    fs,
    ghcr,
    execFile,
    log,
    repo,
    version,
    retries: maxPolls,
    retryMs: pollMs,
    release,
    sleep,
  });
  return { npm, ...ghcrResult };
}
