import { jest } from '@jest/globals';
import {
  buildCiVerificationFailure,
  buildPlatformVerificationFailure,
} from '../../../src/validation/ci/build-ci-verification-failure.mjs';

test('formats observed run details', () => {
  expect(
    buildCiVerificationFailure([{ databaseId: 1, status: 'completed', conclusion: 'failure', headSha: 'abc' }], 'abc'),
  ).toContain('run 1 [completed/failure]');
  expect(buildCiVerificationFailure([], 'abc')).toBe('No successful GitHub Actions run exists for abc.');
});

test('formats platform evidence failures through the job summarizer', () => {
  const exec = jest.fn(() =>
    JSON.stringify({ jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'failure' }] }),
  );
  expect(buildPlatformVerificationFailure(exec, [{ databaseId: 1 }], 'abc')).toContain('lacks a passing Ubuntu job');
});
