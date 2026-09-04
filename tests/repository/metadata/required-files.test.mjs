import { jest } from '@jest/globals';
import { findMissingRepositoryFiles, missingFileMessage } from '../../../src/repository/metadata/required-files.mjs';

test('finds missing required repository files', () => {
  expect(findMissingRepositoryFiles({ existsSync: jest.fn(file => file === 'package.json') })).toEqual(['README.md', 'RELEASE_NOTES.md', '.github/workflows/nodejs.yml']);
  expect(missingFileMessage('README.md')).toContain('README.md');
});
