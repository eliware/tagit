import { verifyGhcrPublication } from "../registries/ghcr-check.mjs";

export function verifyRegistryGhcrCheck({
  fs,
  execFile,
  log,
  repo,
  version,
  release,
  ghcr,
  retries,
  retryMs,
  sleep,
}) {
  return verifyGhcrPublication({
    fs,
    applicable: ghcr,
    execFile,
    log,
    repo,
    version,
    retries,
    retryMs,
    release,
    sleep,
  });
}
