import { validateReleaseVersion } from '../../../src/repository/metadata/validate-release-version.mjs';
test('checks the release-notes version heading', () => {
  expect(validateReleaseVersion({ readFileSync: () => '## 1.2.3' }, { version: '1.2.3' })).toEqual([]);
  expect(validateReleaseVersion({ readFileSync: () => '## 1.2.2' }, { version: '1.2.3' })[0]).toContain('does not match');
});
