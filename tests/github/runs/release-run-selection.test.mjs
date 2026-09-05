import { selectReleaseRun } from '../../../src/github/runs/release-run-selection.mjs';

test('selects the newest exact release tag and commit', () => {
  expect(selectReleaseRun([
    { databaseId: 1, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' },
    { databaseId: 2, createdAt: '2026-01-02', headSha: 'abc', headBranch: 'refs/tags/v1.0.0' },
  ], 'abc', 'v1.0.0').databaseId).toBe(2);
});
test('rejects a malformed provider response before filtering', () => {
  expect(() => selectReleaseRun(null, 'abc', 'v1.0.0')).toThrow('not an array');
});

test('rejects ambiguous incomplete release evidence', () => {
  expect(() => selectReleaseRun([
    { databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' },
    { databaseId: 2, createdAt: '2026-01-02', headSha: 'abc', headBranch: 'v1.0.0' },
  ], 'abc', 'v1.0.0')).toThrow('ambiguous');
});
test('rejects a malformed sole eligible run', () => {
  expect(() => selectReleaseRun([{ databaseId: 'bad', headSha: 'abc', headBranch: 'v1.0.0' }], 'abc', 'v1.0.0')).toThrow('malformed');
  expect(() => selectReleaseRun([{ databaseId: 1, createdAt: 'not-a-date', headSha: 'abc', headBranch: 'v1.0.0' }], 'abc', 'v1.0.0')).toThrow('timestamp');
});
test('uses database id as a tie-breaker when creation times are absent', () => {
  expect(selectReleaseRun([
    { databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' },
    { databaseId: 2, headSha: 'abc', headBranch: 'v1.0.0' },
  ], 'abc', 'v1.0.0').databaseId).toBe(2);
});
