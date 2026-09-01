import { incrementVersion } from '../src/incrementVersion.mjs';

test('increments a valid patch version', () => {
  expect(incrementVersion('1.2.3')).toBe('1.2.4');
});

test('rejects malformed versions', () => {
  expect(() => incrementVersion('1.2')).toThrow('Invalid version');
  expect(() => incrementVersion('next')).toThrow('Invalid version');
});
