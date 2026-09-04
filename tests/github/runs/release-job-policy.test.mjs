import { verifyReleaseJobs } from '../../../src/github/runs/release-job-policy.mjs';

test('accepts successful Ubuntu and optional Windows jobs', () => {
  const result = verifyReleaseJobs([
    { name: 'ubuntu', status: 'completed', conclusion: 'success' },
    { name: 'windows', status: 'completed', conclusion: 'success' },
  ]);
  expect(result.windowsJobs).toHaveLength(1);
});

test('rejects failed Windows or missing Ubuntu jobs', () => {
  expect(() => verifyReleaseJobs([{ name: 'windows', status: 'completed', conclusion: 'failure' }])).toThrow('failing Windows');
  expect(() => verifyReleaseJobs([{ name: 'security', status: 'completed', conclusion: 'success' }])).toThrow('Ubuntu');
});

test('reports a failed non-platform job', () => {
  expect(() => verifyReleaseJobs([
    { name: 'ubuntu', status: 'completed', conclusion: 'success' },
    { name: 'publish', status: 'completed', conclusion: 'failure' },
  ])).toThrow('publish: failure');
});
