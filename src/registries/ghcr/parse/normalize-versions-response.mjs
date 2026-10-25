export function normalizeGhcrVersionsResponse(output) {
  let versions = JSON.parse(output);
  if (!Array.isArray(versions)) throw new Error("GHCR returned an invalid versions response.");
  if (versions.every(Array.isArray)) versions = versions.flat();
  return versions;
}
