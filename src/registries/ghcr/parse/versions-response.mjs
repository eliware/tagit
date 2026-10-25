import { findGhcrVersionImage } from "./version-image.mjs";
import { normalizeGhcrVersionsResponse } from "./normalize-versions-response.mjs";

export function parseGhcrVersionsResponse(output, version) {
  const versions = normalizeGhcrVersionsResponse(output);
  return findGhcrVersionImage(versions, version);
}
