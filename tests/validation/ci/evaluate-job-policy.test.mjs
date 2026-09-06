import { evaluateJobPolicy } from '../../../src/validation/ci/evaluate-job-policy.mjs';

const success = (job) => job.status === 'completed' && job.conclusion === 'success';

test('requires Ubuntu and treats absent Windows as optional', () => {
  expect(
    evaluateJobPolicy([{ name: 'ubuntu-latest', status: 'completed', conclusion: 'success' }], success),
  ).toMatchObject({ failed: false, ubuntu: true, windows: { passed: true, successful: false } });
});

test('requires present Windows jobs to pass and rejects failed jobs', () => {
  const result = evaluateJobPolicy(
    [
      { name: 'ubuntu-latest', status: 'completed', conclusion: 'success' },
      { name: 'windows-latest', status: 'completed', conclusion: 'failure' },
    ],
    success,
  );
  expect(result.failed).toBe(true);
  expect(result.windows.passed).toBe(false);
});
