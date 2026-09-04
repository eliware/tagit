import { jest } from '@jest/globals';
import { verifyPreflightCi } from '../../../src/validation/ci/verify-preflight-ci.mjs';

test('blocks CI verification for a dirty worktree', () => {
  expect(verifyPreflightCi(jest.fn(), { info: jest.fn() }, ' M file.mjs')).toEqual({ passed: false, blocked: true });
});

test('verifies exact HEAD and reports CI errors', () => {
  const exec = jest.fn((command, args) => args[0] === 'rev-parse' ? 'abc\n' : JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc' }]));
  expect(verifyPreflightCi(exec, { info: jest.fn() }, '')).toMatchObject({ passed: false });
  expect(exec).toHaveBeenCalledWith('git', ['rev-parse', 'HEAD'], expect.any(Object));
  const failing = jest.fn(() => { throw new Error('CI unavailable'); });
  expect(verifyPreflightCi(failing, { info: jest.fn() }, '')).toMatchObject({ passed: false, error: expect.any(Error) });
});
