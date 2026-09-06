import { jest } from '@jest/globals';
import { verifyCompletedRun } from '../../../src/validation/ci/verify-completed-run.mjs';
test('returns exact-head success when required jobs pass', () => {
  const exec = jest.fn(() =>
    JSON.stringify({
      status: 'completed',
      conclusion: 'success',
      headSha: 'abc',
      jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }],
    }),
  );
  expect(verifyCompletedRun(exec, { info: jest.fn() }, { databaseId: 1 }, 'abc')).toEqual(
    expect.objectContaining({ ubuntu: true, windows: false }),
  );
});
