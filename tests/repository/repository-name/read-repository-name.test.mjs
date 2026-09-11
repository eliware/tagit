import { jest } from '@jest/globals';
import { readRepositoryName } from '../../../src/repository/repository-name/read-repository-name.mjs';

test('reads the owner and repository from the origin remote', () => {
  expect(readRepositoryName(jest.fn(() => 'git@github.com:eliware/tagit.git'))).toBe('eliware/tagit');
});

test('rejects an origin that is not a GitHub repository', () => {
  expect(() => readRepositoryName(jest.fn(() => 'https://example.com/demo.git'))).toThrow(
    'Cannot determine GitHub repository',
  );
});
