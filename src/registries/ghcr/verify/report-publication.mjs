export function reportGhcrPublication(log, repository, version, digest) {
  log.info(`GHCR verified: ${repository}:${version}.`);
  if (digest) log.info(`GHCR digest: ${digest}`);
}
