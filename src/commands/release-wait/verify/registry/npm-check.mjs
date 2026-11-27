import verifyNpmRegistry from "../registries/npm-check.mjs";

export default async function verifyRegistryNpmCheck(options) {
  const { npm, execFile, log, packageName, version, npmRetries, npmRetryMs, sleep } = options;
  if (!npm) return { npm: false };
  await verifyNpmRegistry({
    execFile,
    log,
    packageName,
    version,
    retries: npmRetries,
    retryMs: npmRetryMs,
    sleep,
  });
  return { npm: true };
}
