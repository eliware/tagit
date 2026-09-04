import { validateJobRecords } from '../../../src/validation/ci/validate-job-records.mjs';

test('accepts valid jobs', () => {
  const jobs = [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }];
  expect(validateJobRecords(jobs, 1)).toBe(jobs);
});

test('rejects malformed job payloads', () => {
  expect(() => validateJobRecords(null, 1)).toThrow('jobs must be an array');
  expect(() => validateJobRecords([42], 1)).toThrow('malformed job records');
});
