export function imageDigest(image) {
  return /^sha256:[a-f0-9]{64}$/.test(image?.name ?? '') ? image.name : null;
}
export function requireExpectedDigest(actual, expected, repository, version) {
  if (expected && actual !== expected) throw new Error(`GHCR digest mismatch for ${repository}:${version}.`);
}
