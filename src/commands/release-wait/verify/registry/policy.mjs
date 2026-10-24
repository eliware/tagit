import { publishesGhcr } from "../../../../registries/ghcr/discover-publication.mjs";

export function selectRegistryPolicy(
  fs,
  log,
  { applicable, packageName, isPrivate },
  ghcrApplicable = publishesGhcr(fs),
) {
  const npm = Boolean(applicable && packageName && !isPrivate);
  const ghcr = ghcrApplicable;
  if (!npm) log.info("npm verification: not applicable.");
  if (!ghcr) log.info("GHCR verification: not applicable.");
  return { npm, ghcr };
}
