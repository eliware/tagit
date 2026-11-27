import publishesGhcr from "../../../../registries/ghcr/discover-publication.mjs";

export default function selectRegistryPolicy(options) {
  const { fs, log, applicable, packageName, isPrivate } = options;
  const ghcrApplicable = publishesGhcr(fs);
  const npm = Boolean(applicable && packageName && !isPrivate);
  const ghcr = ghcrApplicable;
  if (!npm) log.info("npm verification: not applicable.");
  if (!ghcr) log.info("GHCR verification: not applicable.");
  return { ...options, npm, ghcr };
}
