export function requireExpectedDigest(actual, expected, repository, version) {
  if (expected && actual !== expected)
    throw new Error(`GHCR digest mismatch for ${repository}:${version}.`);
}
