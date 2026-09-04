import { jest } from '@jest/globals';
import { pollReleaseCi } from '../../../src/commands/release-wait/release-ci-status.mjs';

test('selects and returns a completed release workflow', async () => {
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, args[1] === 'list' ? JSON.stringify([{ databaseId: 1, createdAt: '2026-01-01', status: 'completed', conclusion: 'success', headSha: 'abc', headBranch: 'v1.0.0', url: 'url' }]) : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] }), ''));
  await expect(pollReleaseCi({ execFile, repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', pollMs: 0, maxPolls: 1, sleep: jest.fn(), linksOnly: false, log: { info: jest.fn() } })).resolves.toMatchObject({ databaseId: 1 });
});
