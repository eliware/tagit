import { verifyRemoteTag } from '../../../src/git/tags/verify-remote-tag.mjs';

test('prefers the peeled remote tag and rejects mismatches', () => {
  expect(verifyRemoteTag('abc\trefs/tags/v1.0.0\ndef\trefs/tags/v1.0.0^{}', 'v1.0.0', 'def')).toBe('def');
  expect(() => verifyRemoteTag('', 'v1.0.0', 'abc')).toThrow('does not resolve');
  expect(() => verifyRemoteTag(undefined, 'v1.0.0', 'abc')).toThrow('does not resolve');
});
