import { validateReleaseRunDetails } from '../../../src/commands/release-wait/validate-release-run-details.mjs';

test('validates release details against the selected candidate and head', () => {
  const details = { databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] };
  expect(validateReleaseRunDetails(details, { databaseId: 1 }, 'abc')).toBe(details);
});

test('rejects mismatched release details', () => {
  expect(() => validateReleaseRunDetails({ status: 'completed', jobs: [] }, { databaseId: 1 }, 'abc')).toThrow(
    'malformed',
  );
});

test('rejects a different workflow id', () => {
  expect(() =>
    validateReleaseRunDetails(
      { databaseId: 2, status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] },
      { databaseId: 1 },
      'abc',
    ),
  ).toThrow('expected 1');
});

test('rejects a different commit', () => {
  expect(() =>
    validateReleaseRunDetails(
      { databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'def', jobs: [] },
      { databaseId: 1 },
      'abc',
    ),
  ).toThrow('expected abc');
});
