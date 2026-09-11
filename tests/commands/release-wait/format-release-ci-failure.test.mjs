import { formatReleaseCiFailure } from '../../../src/commands/release-wait/format-release-ci-failure.mjs';

test('formats completed CI failures with job evidence', () => {
  expect(
    formatReleaseCiFailure({
      status: 'completed',
      conclusion: 'failure',
      jobs: [{ name: 'test', status: 'completed', conclusion: 'failure' }],
    }),
  ).toContain('test [completed/failure]');
});

test('reports failed runs without jobs', () => {
  expect(formatReleaseCiFailure({ status: 'completed', conclusion: 'failure', jobs: [] })).toContain('none reported');
});

test('does not report pending or successful runs as failures', () => {
  expect(formatReleaseCiFailure({ status: 'in_progress', conclusion: null, jobs: [] })).toBeNull();
  expect(formatReleaseCiFailure({ status: 'completed', conclusion: 'success', jobs: [] })).toBeNull();
});
