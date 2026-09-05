import { jest } from '@jest/globals';
import { findMissingRepositoryFiles, missingFileMessage } from '../../../src/repository/metadata/required-files.mjs';

test('finds missing required repository files', () => {
  expect(findMissingRepositoryFiles({ existsSync: jest.fn(file => file === 'package.json') })).toEqual(['README.md', 'AGENTS.md', 'RELEASE_NOTES.md', 'docs/', 'specs/', 'examples/', '.env.example', '.github/workflows/nodejs.yml']);
  expect(missingFileMessage('README.md')).toContain('README.md');
});

test('allows only explicitly documented inapplicable paths', () => {
  const fs = { existsSync: file => file === '.tagit-exceptions.json' || file === 'package.json', readFileSync: () => JSON.stringify({ inapplicable: { 'examples/': 'No examples apply.' } }) };
  expect(findMissingRepositoryFiles(fs)).not.toContain('examples/');
  expect(findMissingRepositoryFiles(fs)).toContain('docs/');
});

test('requires directory paths to resolve to directories', () => {
  const fs = {
    existsSync: file => ['package.json', 'docs/', 'specs/', 'examples/'].includes(file),
    lstatSync: file => ({ isDirectory: () => file !== 'docs/' }),
  };
  expect(findMissingRepositoryFiles(fs)).toEqual(['README.md', 'AGENTS.md', 'RELEASE_NOTES.md', 'docs/', '.env.example', '.github/workflows/nodejs.yml']);
});
