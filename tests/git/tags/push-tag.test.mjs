import { jest } from '@jest/globals';
import { pushTag } from '../../../src/git/tags/push-tag.mjs';

test('pushes only the release tag to origin', () => {
  const runGit = jest.fn();
  pushTag(runGit, 'v1.2.3');
  expect(runGit).toHaveBeenCalledWith(['push', 'origin', 'v1.2.3'], { stdio: 'inherit' });
});
