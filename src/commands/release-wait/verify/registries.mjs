import { verifyNpmRegistry } from "./registries/npm.mjs";
import { verifyGhcrPublication } from "./registries/ghcr-adapter.mjs";
import { selectRegistryPolicy } from "./registry-policy.mjs";

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
  ghcrApplicable,
  maxPolls,
  npmRetries,
  pollMs,
  npmRetryMs,
  sleep,
}) {
  const { npm, ghcr } = selectRegistryPolicy(
    fs,
    log,
    { applicable, packageName, isPrivate },
    ghcrApplicable,
  );
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
  const ghcrResult = await verifyGhcrPublication({
    fs,
    applicable: ghcr,
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
