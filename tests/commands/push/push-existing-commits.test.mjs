import { jest } from '@jest/globals';
import { pushExistingCommits } from '../../../src/commands/push/push-existing-commits.mjs';

test('pushes existing commits without staging or tagging', () => {
  const exec = jest.fn();
  pushExistingCommits(exec);
  expect(exec).toHaveBeenCalledWith('git', ['push'], { stdio: 'inherit' });
});
