import { jest } from '@jest/globals';
import { createTag } from '../../../src/git/tags/create-tag.mjs';

test('creates a tag at the verified commit', () => {
  const runGit = jest.fn();
  createTag(runGit, 'v1.2.3', 'abc');
  expect(runGit).toHaveBeenCalledWith(['tag', 'v1.2.3', 'abc'], { stdio: 'inherit' });
});
