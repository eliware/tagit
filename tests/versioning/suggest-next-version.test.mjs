import { suggestNextVersion } from '../../src/versioning/suggest-next-version.mjs';

test('increments major, minor, and patch levels', () => {
  expect(suggestNextVersion('1.2.3', 'major')).toBe('2.0.0');
  expect(suggestNextVersion('1.2.3', 'minor')).toBe('1.3.0');
  expect(suggestNextVersion('1.2.3', 'patch')).toBe('1.2.4');
});

test('rejects invalid input', () => {
  expect(() => suggestNextVersion('bad', 'patch')).toThrow('Invalid version');
});
