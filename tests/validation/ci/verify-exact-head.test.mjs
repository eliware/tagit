import { jest } from '@jest/globals';
import { verifyLatestCi } from '../../../src/validation/ci/verify-exact-head.mjs';

const log = { info: jest.fn() };

function successfulRun(id = 1) {
  return JSON.stringify([{ databaseId: id, status: 'completed', conclusion: 'success', headSha: 'abc' }]);
}

function successfulDetails(headSha = 'abc') {
  return JSON.stringify({
    status: 'completed',
    conclusion: 'success',
    headSha,
    jobs: [{ name: 'ubuntu-latest', status: 'completed', conclusion: 'success' }],
  });
}

test('verifies a successful exact-head Ubuntu run', () => {
  const exec = jest.fn((command, args) => (args[1] === 'list' ? successfulRun() : successfulDetails()));
  expect(verifyLatestCi(exec, log, { headSha: 'abc' })).toMatchObject({ runId: 1, ubuntu: true, windows: false });
});

test('polls an in-progress exact-head run and rechecks it', () => {
  let listed = 0;
  const exec = jest.fn((command, args) => {
    if (args[1] === 'list')
      return listed++ === 0
        ? JSON.stringify([{ databaseId: 2, status: 'in_progress', conclusion: '', headSha: 'abc' }])
        : successfulRun(2);
    if (args[1] === 'watch') return '';
    return successfulDetails();
  });
  expect(verifyLatestCi(exec, log, { headSha: 'abc' })).toMatchObject({ runId: 2 });
});

test('rejects missing, stale, or failed exact-head evidence', () => {
  expect(() => verifyLatestCi(jest.fn(), log)).toThrow('commit SHA is required');
  expect(() =>
    verifyLatestCi(
      jest.fn(() => '[]'),
      log,
      { headSha: 'abc' },
    ),
  ).toThrow('No successful');
  expect(() =>
    verifyLatestCi(
      jest.fn(() => JSON.stringify([{ databaseId: 3, status: 'completed', conclusion: 'failure', headSha: 'abc' }])),
      log,
      { headSha: 'abc' },
    ),
  ).toThrow('run 3');
});

test('rejects exact-head runs without passing Ubuntu evidence', () => {
  const exec = jest.fn((command, args) => (args[1] === 'list' ? successfulRun(4) : successfulDetails('other')));
  expect(() => verifyLatestCi(exec, log, { headSha: 'abc' })).toThrow('lacks a passing Ubuntu');
});
