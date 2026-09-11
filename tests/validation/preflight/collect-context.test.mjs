import { jest } from '@jest/globals';
import { collectPreflightContext } from '../../../src/validation/preflight/collect-context.mjs';

test('collects worktree status and clean-worktree result', () => {
  const execFileSync = jest.fn(() => '');
  expect(collectPreflightContext(execFileSync)).toEqual({ status: expect.anything(), dirtyFailure: null });
});
