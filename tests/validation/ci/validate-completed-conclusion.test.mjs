import { validateCompletedConclusion } from '../../../src/validation/ci/validate-completed-conclusion.mjs';

test('accepts successful and pending conclusions', () => {
  expect(() =>
    validateCompletedConclusion({ status: 'completed', databaseId: 1, conclusion: 'success' }),
  ).not.toThrow();
  expect(() => validateCompletedConclusion({ status: 'in_progress' })).not.toThrow();
});

test('rejects malformed and failed completed conclusions', () => {
  expect(() => validateCompletedConclusion({ status: 'completed', databaseId: 1, conclusion: 'unknown' })).toThrow(
    'malformed',
  );
  expect(() => validateCompletedConclusion({ status: 'completed', databaseId: 1, conclusion: 'failure' })).toThrow(
    'failed',
  );
});
