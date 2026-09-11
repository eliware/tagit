import { mergeReleaseRun } from '../../../src/commands/release-wait/merge-release-run.mjs';

test('merges candidate identity with workflow details', () => {
  expect(mergeReleaseRun({ databaseId: 1, headBranch: 'v1' }, { headSha: 'abc', status: 'completed' })).toEqual({
    databaseId: 1,
    headBranch: 'v1',
    headSha: 'abc',
    status: 'completed',
  });
});
