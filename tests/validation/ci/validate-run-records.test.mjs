import { validateRunRecords } from '../../../src/validation/ci/validate-run-records.mjs';

test('accepts valid run records', () => {
  const runs = [{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc' }];
  expect(validateRunRecords(runs, 'abc')).toBe(runs);
});

test('accepts a pending run with a null conclusion', () => {
  const runs = [{ databaseId: 1, status: 'in_progress', conclusion: null, headSha: 'abc' }];
  expect(validateRunRecords(runs, 'abc')).toBe(runs);
});

test('rejects malformed run lists and entries', () => {
  expect(() => validateRunRecords({}, 'abc')).toThrow('must be an array');
  expect(() => validateRunRecords([null], 'abc')).toThrow('malformed CI run records');
});

test('reports primitive and null run entries', () => {
  expect(() => validateRunRecords([null], 'abc')).toThrow('null');
  expect(() => validateRunRecords(['run'], 'abc')).toThrow('string');
});
test('reports malformed object details', () => {
  expect(() => validateRunRecords([{}], 'abc')).toThrow('{}');
});
