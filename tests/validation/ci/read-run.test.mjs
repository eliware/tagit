import { readCiRun } from '../../../src/validation/ci/read-run.mjs';

test('reads a GitHub Actions run by id', () => {
  expect(readCiRun(() => '{"status":"completed"}', 42)).toEqual({ status: 'completed' });
});
