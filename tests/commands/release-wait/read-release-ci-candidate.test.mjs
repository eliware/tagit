import { jest } from '@jest/globals';
import { readReleaseCiCandidate } from '../../../src/commands/release-wait/read-release-ci-candidate.mjs';

test('reads and selects the release workflow candidate', async () => {
  const execFile = jest.fn((_command, _args, _options, callback) =>
    callback(
      null,
      JSON.stringify([{ databaseId: 7, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' }]),
      '',
    ),
  );
  await expect(readReleaseCiCandidate(execFile, 'eliware/demo', 'abc', 'v1.0.0')).resolves.toMatchObject({
    databaseId: 7,
  });
});
