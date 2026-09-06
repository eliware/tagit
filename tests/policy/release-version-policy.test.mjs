import { requireExplicitReleaseVersion } from '../../src/policy/release-version-policy.mjs';

test('requires release commands to carry a version', () => {
  expect(() => requireExplicitReleaseVersion({ command: 'release', version: null })).toThrow(
    'specific release version',
  );
  expect(() => requireExplicitReleaseVersion({ command: 'release', version: '1.2.3' })).not.toThrow();
});
