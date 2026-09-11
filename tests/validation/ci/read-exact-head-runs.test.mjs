import { jest } from '@jest/globals';
import { readExactHeadRuns } from '../../../src/validation/ci/read-exact-head-runs.mjs';

test('reads and validates runs for an exact commit', () => {
  const execFileSync = jest.fn(() =>
    JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc' }]),
  );
  expect(readExactHeadRuns(execFileSync, 'abc', 'eliware/demo').runs).toHaveLength(1);
});

test('reads a selected run using view mode and merges its identity', () => {
  const execFileSync = jest.fn(() => JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc' }));
  const result = readExactHeadRuns(execFileSync, 'abc', null, { databaseId: 2, url: 'url' });
  expect(execFileSync).toHaveBeenCalledWith('gh', expect.arrayContaining(['view', '2']), { encoding: 'utf8' });
  expect(result.runs[0]).toMatchObject({ databaseId: 2, headSha: 'abc' });
});

test('wraps malformed GitHub responses with commit context', () => {
  const execFileSync = jest.fn(() => '{bad');
  expect(() => readExactHeadRuns(execFileSync, 'abc', 'eliware/demo')).toThrow(
    'Unable to inspect GitHub Actions runs for abc',
  );
});
