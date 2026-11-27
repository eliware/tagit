import verifyGhcrRegistry from "./ghcr.mjs";

export default async function verifyGhcrPublication({
  applicable,
  execFile,
  log,
  repo,
  version,
  retries,
  retryMs,
  release,
  sleep,
}) {
  if (!applicable) return { ghcr: false };
  const { imageDigest } = await verifyGhcrRegistry({
    execFile,
    log,
    repo,
    version,
    retries,
    retryMs,
    release,
    sleep,
  });
  return { ghcr: true, imageDigest };
}
