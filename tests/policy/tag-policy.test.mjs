import { releaseTag } from '../../src/policy/tag-policy.mjs';

test('formats the immutable release tag', () => {
  expect(releaseTag('1.2.3')).toBe('v1.2.3');
});
