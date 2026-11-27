import verifyGhcrPublication from "../registries/ghcr-check.mjs";

export default function verifyRegistryGhcrCheck(options) {
  const { fs, execFile, log, repo, version, release, ghcr, maxPolls, pollMs, sleep } = options;
  return verifyGhcrPublication({
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
}
