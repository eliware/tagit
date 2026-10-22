import { publishesGhcr } from "../../../registries/ghcr/discover-publication.mjs";
import { verifyGhcrRegistry } from "./registries/ghcr.mjs";

export async function verifyGhcrRegistryIfApplicable(fs, options, applicable = publishesGhcr(fs)) {
  if (!applicable) return { ghcr: false };
  const { imageDigest } = await verifyGhcrRegistry(options);
  return { ghcr: true, imageDigest };
}
