import { readRepositoryName } from '../../../src/github/links/read-repository-name.mjs';

test('reads repository owner and name from Git remotes', () => {
  expect(readRepositoryName(() => 'https://github.com/eliware/tagit.git\n')).toBe('eliware/tagit');
});

test('rejects an unusable remote', () => {
  expect(() => readRepositoryName(() => 'not-a-repository')).toThrow('Cannot determine GitHub repository');
  expect(() => readRepositoryName(() => 'https://gitlab.com/eliware/tagit.git')).toThrow(
    'Cannot determine GitHub repository',
  );
});
