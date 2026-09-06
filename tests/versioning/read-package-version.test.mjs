import { jest } from '@jest/globals';
import { readPackageVersion } from '../../src/versioning/read-package-version.mjs';

test('reads a valid package version and rejects invalid versions', () => {
  expect(readPackageVersion({ readFileSync: jest.fn(() => '{"version":"1.2.3"}') })).toBe('1.2.3');
  expect(() => readPackageVersion({ readFileSync: jest.fn(() => '{"version":"next"}') })).toThrow(
    'invalid current version',
  );
});
