import { selectCiCandidate } from '../../../src/validation/ci/select-ci-candidate.mjs';

test('selects successful and pending runs for the requested head', () => {
  const successful = { databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc' };
  expect(selectCiCandidate(successful, 'abc')).toEqual({ candidates: [successful], pending: null });
  const pending = { databaseId: 2, status: 'in_progress', conclusion: '', headSha: 'abc' };
  expect(selectCiCandidate(pending, 'abc')).toEqual({ candidates: [], pending });
});

test('rejects a run belonging to another head', () => {
  expect(selectCiCandidate({ status: 'completed', conclusion: 'success', headSha: 'old' }, 'abc')).toEqual({
    candidates: [],
    pending: null,
  });
});
