import { validateJobRecords } from '../../../src/validation/ci/validate-job-records.mjs';

test('accepts valid jobs', () => {
  const jobs = [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }];
  expect(validateJobRecords(jobs, 1)).toBe(jobs);
});

test('accepts a queued job with a null conclusion', () => {
  const jobs = [{ name: 'ubuntu', status: 'in_progress', conclusion: null }];
  expect(validateJobRecords(jobs, 1)).toBe(jobs);
});

test('rejects malformed job payloads', () => {
  expect(() => validateJobRecords(null, 1)).toThrow('jobs must be an array');
  expect(() => validateJobRecords([42], 1)).toThrow('malformed job records');
});

test('reports malformed primitive and null job entries', () => {
  expect(() => validateJobRecords([null], 1)).toThrow('null');
  expect(() => validateJobRecords(['job'], 1)).toThrow('string');
});
test('reports malformed object details', () => {
  expect(() => validateJobRecords([{}], 1)).toThrow('{}');
});
