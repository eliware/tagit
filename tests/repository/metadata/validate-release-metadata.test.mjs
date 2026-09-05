import { validateReleaseMetadata } from '../../../src/repository/metadata/validate-release-metadata.mjs';

const base = { version: '2.5.0', repository: { url: 'https://github.com/eliware/tagit' }, files: ['README.md', 'LICENSE', 'RELEASE_NOTES.md'] };
const fs = { readFileSync: file => file === 'RELEASE_NOTES.md' ? '# Release Notes\n\n## 2.5.0\n' : '', existsSync: file => ['README.md', 'LICENSE', 'RELEASE_NOTES.md'].includes(file) };

test('accepts synchronized release metadata and origin', () => {
  expect(validateReleaseMetadata(fs, () => 'https://github.com/eliware/tagit.git', base)).toEqual([]);
});

test('reports heading, allowlist, stale path, and remote drift', () => {
  const failures = validateReleaseMetadata({ readFileSync: () => '## 1.0.0', existsSync: () => false }, () => 'https://github.com/other/project.git', { ...base, files: ['README.md', 'missing/'] });
  expect(failures.join('\n')).toEqual(expect.stringContaining('does not match'));
  expect(failures.join('\n')).toEqual(expect.stringContaining('does not exist'));
  expect(failures.join('\n')).toEqual(expect.stringContaining('does not match origin'));
});
