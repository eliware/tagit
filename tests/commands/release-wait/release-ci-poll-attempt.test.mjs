import { jest } from '@jest/globals';
import { runReleaseCiPollAttempt } from '../../../src/commands/release-wait/release-ci-poll-attempt.mjs';

function executor(list, details) {
  return jest.fn((_command, args, _options, callback) =>
    callback(null, JSON.stringify(args[1] === 'list' ? list : details), ''),
  );
}

const base = { repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', linksOnly: false, log: { info: jest.fn() } };

test('returns no result when the release workflow is not present', async () => {
  await expect(runReleaseCiPollAttempt({ ...base, execFile: executor([], {}) })).resolves.toBeNull();
});

test('returns pending state for an in-progress workflow', async () => {
  const run = { databaseId: 1, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' };
  await expect(
    runReleaseCiPollAttempt({
      ...base,
      execFile: executor([run], { ...run, status: 'in_progress', conclusion: null, jobs: [] }),
    }),
  ).resolves.toEqual({ pending: true });
});
