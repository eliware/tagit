import { validatePackageFiles } from '../../../src/repository/metadata/validate-package-files.mjs';
test('checks package files and public files', () => {
  expect(
    validatePackageFiles({ existsSync: (file) => file === 'README.md' }, { files: ['README.md', 'missing'] }).join(
      '\n',
    ),
  ).toContain('missing');
});
