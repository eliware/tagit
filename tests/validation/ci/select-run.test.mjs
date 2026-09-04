import { selectLatestRun, successfulRun } from '../../../src/validation/ci/select-run.mjs';

test('selects the newest exact-head run', () => {
  expect(selectLatestRun([{ databaseId: 1, headSha: 'abc' }, { databaseId: 2, headSha: 'abc' }, { databaseId: 9, headSha: 'old' }], 'abc').databaseId).toBe(2);
});

test('identifies successful completed runs', () => {
  const run = { status: 'completed', conclusion: 'success' };
  expect(successfulRun(run)).toBe(run);
  expect(successfulRun({ status: 'in_progress', conclusion: '' })).toBeNull();
});
