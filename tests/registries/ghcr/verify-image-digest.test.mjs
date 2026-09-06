import { imageDigest, requireExpectedDigest } from '../../../src/registries/ghcr/verify-image-digest.mjs';

test('reads and validates image digests', () => {
  const digest = `sha256:${'a'.repeat(64)}`;
  expect(imageDigest({ name: digest })).toBe(digest);
  expect(imageDigest({})).toBeNull();
  expect(() => requireExpectedDigest(digest, `sha256:${'b'.repeat(64)}`, 'eliware/demo', '1.0.0')).toThrow(
    'digest mismatch',
  );
  expect(() => requireExpectedDigest(digest, digest, 'eliware/demo', '1.0.0')).not.toThrow();
});
