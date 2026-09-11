import { jest } from '@jest/globals';
import { summarizeCiJobs } from '../../../src/validation/ci/summarize-ci-jobs.mjs';

test('summarizes job statuses for candidates', () => {
  const execFileSync = jest.fn(() =>
    JSON.stringify({ jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }] }),
  );
  expect(summarizeCiJobs(execFileSync, [{ databaseId: 1 }])).toContain('ubuntu [completed/success]');
});
