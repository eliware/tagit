import { selectReleaseRun } from '../../../src/github/runs/release-run-selection.mjs';

test('selects the newest exact release tag and commit', () => {
  expect(selectReleaseRun([
    { databaseId: 1, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' },
    { databaseId: 2, createdAt: '2026-01-02', headSha: 'abc', headBranch: 'refs/tags/v1.0.0' },
  ], 'abc', 'v1.0.0').databaseId).toBe(2);
});

test('rejects ambiguous incomplete release evidence', () => {
  expect(() => selectReleaseRun([
    { databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' },
    { databaseId: 2, createdAt: '2026-01-02', headSha: 'abc', headBranch: 'v1.0.0' },
  ], 'abc', 'v1.0.0')).toThrow('ambiguous');
});
