import { hasVersionTag } from "../verify/version-tag.mjs";

export function parseGhcrVersionsResponse(output, version) {
  let versions = JSON.parse(output);
  if (!Array.isArray(versions)) throw new Error("GHCR returned an invalid versions response.");
  if (versions.every(Array.isArray)) versions = versions.flat();
  return versions.find((item) => hasVersionTag(item, `v${version}`)) ?? null;
}
