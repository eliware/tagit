import { jest } from '@jest/globals';
import { verifyLatestCi } from '../../../src/validation/ci/verify-exact-head.mjs';

const log = { info: jest.fn() };

test('accepts successful Ubuntu CI and optional Windows CI', () => {
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [{ name: 'ubuntu-latest', status: 'completed', conclusion: 'success' }] }));
  expect(verifyLatestCi(exec, log, { headSha: 'abc' })).toMatchObject({ runId: 1, ubuntu: true, windows: false });
});

test('accepts a successful Windows job when present', () => {
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 2, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu-latest', status: 'completed', conclusion: 'success' },
      { name: 'windows-latest', status: 'completed', conclusion: 'success' },
    ] }));
  expect(verifyLatestCi(exec, log, { headSha: 'abc' })).toMatchObject({ windows: true });
});

test('rejects a failed Windows job when Windows CI is present', () => {
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 16, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu-latest', status: 'completed', conclusion: 'success' },
      { name: 'windows-latest', status: 'completed', conclusion: 'success' },
      { name: 'windows-arm', status: 'completed', conclusion: 'failure' },
    ] }));
  expect(() => verifyLatestCi(exec, log, { headSha: 'abc' })).toThrow('lacks a passing Ubuntu');
});

test('rejects a failed non-platform job', () => {
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 17, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu-latest', status: 'completed', conclusion: 'success' },
      { name: 'security', status: 'completed', conclusion: 'failure' },
    ] }));
  expect(() => verifyLatestCi(exec, log, { headSha: 'abc' })).toThrow('lacks a passing Ubuntu');
});

test('rejects a completed job with no conclusion', () => {
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 18, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu-latest', status: 'completed', conclusion: 'success' },
      { name: 'checks', status: 'completed' },
    ] }));
  expect(() => verifyLatestCi(exec, log, { headSha: 'abc' })).toThrow('malformed job records');
});

test('allows skipped optional jobs when Ubuntu passes', () => {
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 21, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu-latest', status: 'completed', conclusion: 'success' },
      { name: 'optional', status: 'completed', conclusion: 'skipped' },
    ] }));
  expect(verifyLatestCi(exec, log, { headSha: 'abc' })).toMatchObject({ runId: 21 });
});

test('prefers the newest exact-head run over older successful evidence', () => {
  let listed = 0;
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify(listed++ === 0 ? [
      { databaseId: 3, status: 'in_progress', conclusion: '', headSha: 'abc' },
      { databaseId: 2, status: 'completed', conclusion: 'success', headSha: 'abc' },
    ] : [{ databaseId: 3, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }] }));
  expect(verifyLatestCi(exec, log, { headSha: 'abc' })).toMatchObject({ runId: 3 });
});

test('waits for pending exact-head CI and then rechecks it', () => {
  let listCalls = 0;
  const exec = jest.fn((command, args) => {
    if (args[1] === 'list') {
      listCalls += 1;
      return JSON.stringify([listCalls === 1
        ? { databaseId: 3, status: 'in_progress', conclusion: '', headSha: 'abc', url: 'https://ci/3' }
        : { databaseId: 3, status: 'completed', conclusion: 'success', headSha: 'abc' }]);
    }
    if (args[1] === 'watch') return '';
    return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }] });
  });
  expect(verifyLatestCi(exec, log, { headSha: 'abc' })).toMatchObject({ runId: 3 });
});

test('rejects missing, stale, failed, or incomplete CI evidence', () => {
  expect(() => verifyLatestCi(jest.fn(), log)).toThrow('commit SHA is required');
  expect(() => verifyLatestCi(jest.fn(() => '[]'), log, { headSha: 'abc' })).toThrow('No successful');
  const stale = jest.fn(() => JSON.stringify([{ databaseId: 4, status: 'completed', conclusion: 'success', headSha: 'old' }]));
  expect(() => verifyLatestCi(stale, log, { headSha: 'abc' })).toThrow('No successful');
  const incomplete = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 5, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ headSha: 'abc', jobs: [{ name: 'windows', status: 'completed', conclusion: 'success' }] }));
  expect(() => verifyLatestCi(incomplete, log, { headSha: 'abc' })).toThrow('lacks a passing Ubuntu');
});

test('waits for pending runs and reports run details', () => {
  let listed = 0;
  const exec = jest.fn((command, args) => {
    if (args[1] === 'list') {
      listed += 1;
      return listed === 1
        ? JSON.stringify([{ databaseId: 6, status: 'in_progress', conclusion: '', headSha: 'abc' }])
        : JSON.stringify([{ databaseId: 6, status: 'completed', conclusion: 'failure', headSha: 'abc' }]);
    }
    if (args[1] === 'watch') throw new Error('watch failed');
    return '';
  });
  expect(() => verifyLatestCi(exec, log, { headSha: 'abc' })).toThrow('No successful');
});

test('reports missing or mismatched platform jobs', () => {
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 7, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ headSha: 'other', jobs: [{ name: 'windows', status: 'completed', conclusion: 'success' }] }));
  expect(() => verifyLatestCi(exec, log, { headSha: 'abc' })).toThrow('lacks a passing Ubuntu');
});

test('sorts multiple runs and handles a pending run without a URL', () => {
  let listed = 0;
  const exec = jest.fn((command, args) => {
    if (args[1] === 'list') {
      listed += 1;
      return listed === 1
        ? JSON.stringify([
          { databaseId: 2, status: 'in_progress', conclusion: '', headSha: 'abc' },
          { databaseId: 1, status: 'completed', conclusion: 'failure', headSha: 'abc' },
        ])
        : JSON.stringify([{ databaseId: 2, status: 'completed', conclusion: 'success', headSha: 'abc' }]);
    }
    return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }] });
  });
  expect(verifyLatestCi(exec, log, { headSha: 'abc' })).toMatchObject({ runId: 2 });
});

test('reports failed runs without URLs and malformed job payloads', () => {
  const failed = jest.fn(() => JSON.stringify([{ databaseId: 10, status: 'completed', conclusion: 'failure', headSha: 'abc' }]));
  expect(() => verifyLatestCi(failed, log, { headSha: 'abc' })).toThrow('run 10');
  const malformed = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 11, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ headSha: 'abc', jobs: null }));
  expect(() => verifyLatestCi(malformed, log, { headSha: 'abc' })).toThrow('malformed job records');
  expect(() => verifyLatestCi(failed, log, { headSha: 'abc', waitForCompletion: false })).toThrow('run 10');
  const failedWithUrl = jest.fn(() => JSON.stringify([{ databaseId: 12, status: 'completed', conclusion: 'failure', headSha: 'abc', url: 'https://ci/12' }]));
  expect(() => verifyLatestCi(failedWithUrl, log, { headSha: 'abc' })).toThrow('run 12');
  const pending = jest.fn(() => JSON.stringify([{ databaseId: 13, status: 'in_progress', conclusion: '', headSha: 'abc' }]));
  expect(() => verifyLatestCi(pending, log, { headSha: 'abc' }, 30)).toThrow('No successful');
});

test('uses the completed-candidate branch when a successful run is present', () => {
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 14, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }] }));
  expect(verifyLatestCi(exec, log, { headSha: 'abc' })).toMatchObject({ runId: 14 });
});

test('passes an explicit repository to GitHub CLI inspection', () => {
  const exec = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 15, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }] }));
  verifyLatestCi(exec, log, { headSha: 'abc', repository: 'eliware/tagit' });
  expect(exec).toHaveBeenCalledWith('gh', expect.arrayContaining(['--repo', 'eliware/tagit']), expect.any(Object));
});

test('rejects malformed run-list responses', () => {
  expect(() => verifyLatestCi(jest.fn(() => JSON.stringify({ runs: [] })), log, { headSha: 'abc' })).toThrow('must be an array');
  const malformedEntry = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([null, { databaseId: 20, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }] }));
  expect(() => verifyLatestCi(malformedEntry, log, { headSha: 'abc' })).toThrow('malformed CI run records');
});

test('reports malformed primitive and object run and job records', () => {
  const malformedRuns = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([null, 42, { databaseId: 20, status: 'completed', conclusion: 'success' }])
    : '');
  expect(() => verifyLatestCi(malformedRuns, log, { headSha: 'abc' })).toThrow('entry 3');

  const malformedJobs = jest.fn((command, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 21, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [null, 42] }));
  expect(() => verifyLatestCi(malformedJobs, log, { headSha: 'abc' })).toThrow('job 2');
});
