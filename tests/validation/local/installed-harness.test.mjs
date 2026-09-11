import { hasInstalledSharedHarness } from '../../../src/validation/local/installed-harness.mjs';
test('requires a real installed shared harness', () => {
  const fs = { existsSync: () => true, lstatSync: () => ({ isSymbolicLink: () => false }) };
  expect(hasInstalledSharedHarness(fs, { name: 'demo', devDependencies: { '@eliware/test': '^4.0.0' } })).toBe(true);
});

test('allows the shared harness package itself and rejects missing or linked installs', () => {
  expect(hasInstalledSharedHarness({ existsSync: () => false }, { name: '@eliware/test' })).toBe(true);
  expect(hasInstalledSharedHarness({ existsSync: () => false }, { name: 'demo' })).toBe(false);
  expect(
    hasInstalledSharedHarness(
      { existsSync: () => true, lstatSync: () => ({ isSymbolicLink: () => true }) },
      { name: 'demo', devDependencies: { '@eliware/test': '^7.0.0' } },
    ),
  ).toBe(false);
});

test('accepts unnamed packages and filesystems without lstat', () => {
  expect(hasInstalledSharedHarness({ existsSync: () => false }, {})).toBe(true);
  expect(
    hasInstalledSharedHarness(
      { existsSync: () => true },
      { name: 'demo', devDependencies: { '@eliware/test': '^7.0.0' } },
    ),
  ).toBe(true);
});
