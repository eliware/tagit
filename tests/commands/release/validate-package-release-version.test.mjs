import { validatePackageReleaseVersion } from '../../../src/commands/release/validate-package-release-version.mjs';

test('accepts a matching package version and packages without metadata', () => {
  expect(() => validatePackageReleaseVersion({ existsSync: () => false }, '1.0.0')).not.toThrow();
  expect(() =>
    validatePackageReleaseVersion(
      { existsSync: () => true, readFileSync: () => JSON.stringify({ version: '1.0.0' }) },
      '1.0.0',
    ),
  ).not.toThrow();
});

test('rejects a mismatched package version', () => {
  expect(() =>
    validatePackageReleaseVersion(
      { existsSync: () => true, readFileSync: () => JSON.stringify({ version: '1.0.0' }) },
      '2.0.0',
    ),
  ).toThrow('does not match');
});
