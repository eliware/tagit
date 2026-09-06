import { hasVersionTag } from '../../../src/registries/ghcr/verify-version-tag.mjs';

test('checks the published version tag', () => {
  expect(hasVersionTag({ metadata: { container: { tags: ['v1.0.0'] } } }, 'v1.0.0')).toBe(true);
  expect(hasVersionTag({}, 'v1.0.0')).toBe(false);
});
