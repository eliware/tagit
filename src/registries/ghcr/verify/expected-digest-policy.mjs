export function requireExpectedDigest(actual, expected, repository, version) {
  if (!actual)
    throw new Error(`GHCR image has no valid SHA-256 digest for ${repository}:${version}.`);
  if (expected && actual !== expected)
    throw new Error(`GHCR digest mismatch for ${repository}:${version}.`);
}
