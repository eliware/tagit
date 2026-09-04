import { jest } from '@jest/globals';
import { readRepositoryName } from '../../../src/repository/repository-name/read-repository-name.mjs';

test('reads the owner and repository from the origin remote', () => {
  expect(readRepositoryName(jest.fn(() => 'git@github.com:eliware/tagit.git'))).toBe('eliware/tagit');
});
