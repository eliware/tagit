import { jest } from '@jest/globals';
import { pollPendingRun } from '../../../src/validation/ci/poll-pending-run.mjs';

test('watches pending runs within the polling budget', () => {
  const exec = jest.fn();
  expect(pollPendingRun(exec, { info: jest.fn() }, { databaseId: 42, url: 'run' }, ['--repo', 'eliware/tagit'], 0)).toBe(true);
  expect(exec).toHaveBeenCalledWith('gh', ['run', 'watch', '42', '--repo', 'eliware/tagit', '--exit-status', '--interval', '10'], { encoding: 'utf8', timeout: 10000 });
});

test('does not poll absent or exhausted runs', () => {
  const exec = jest.fn();
  expect(pollPendingRun(exec, { info: jest.fn() }, null, [], 0)).toBe(false);
  expect(pollPendingRun(exec, { info: jest.fn() }, { databaseId: 1 }, [], 30)).toBe(false);
  expect(exec).not.toHaveBeenCalled();
});
