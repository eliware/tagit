import { jest } from '@jest/globals';
import { pollReleaseCi } from '../../../src/commands/release-wait/release-ci-status.mjs';

test('selects and returns a completed release workflow', async () => {
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, args[1] === 'list' ? JSON.stringify([{ databaseId: 1, createdAt: '2026-01-01', status: 'completed', conclusion: 'success', headSha: 'abc', headBranch: 'v1.0.0', url: 'url' }]) : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] }), ''));
  await expect(pollReleaseCi({ execFile, repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', pollMs: 0, maxPolls: 1, sleep: jest.fn(), linksOnly: false, log: { info: jest.fn() } })).resolves.toMatchObject({ databaseId: 1 });
});
test('rejects malformed list JSON immediately', async () => {
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, args[1] === 'list' ? '{' : '{}', ''));
  await expect(pollReleaseCi({ execFile, repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', pollMs: 0, maxPolls: 3, sleep: jest.fn(), linksOnly: false, log: { info: jest.fn() } })).rejects.toThrow('malformed list JSON');
});
test('links-only mode requires a successful completed job', async () => {
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, args[1] === 'list' ? JSON.stringify([{ databaseId: 2, createdAt: '2026-01-01', status: 'completed', conclusion: 'success', headSha: 'abc', headBranch: 'v1.0.0' }]) : JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] }), ''));
  await expect(pollReleaseCi({ execFile, repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', pollMs: 0, maxPolls: 1, sleep: jest.fn(), linksOnly: true, log: { info: jest.fn() } })).rejects.toThrow('successful job');
});
test('reports failed job details for a completed unsuccessful run', async () => {
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, args[1] === 'list' ? JSON.stringify([{ databaseId: 3, createdAt: '2026-01-01', status: 'completed', conclusion: 'failure', headSha: 'abc', headBranch: 'v1.0.0' }]) : JSON.stringify({ status: 'completed', conclusion: 'failure', headSha: 'abc', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'failure' }] }), ''));
  await expect(pollReleaseCi({ execFile, repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', pollMs: 0, maxPolls: 1, sleep: jest.fn(), linksOnly: false, log: { info: jest.fn() } })).rejects.toThrow('ubuntu [completed/failure]');
});
test('reports a detail-level failure when the list and detail records differ', async () => {
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, args[1] === 'list' ? JSON.stringify([{ databaseId: 4, createdAt: '2026-01-01', status: 'completed', conclusion: 'success', headSha: 'abc', headBranch: 'v1.0.0' }]) : JSON.stringify({ status: 'completed', conclusion: 'failure', headSha: 'abc', jobs: [{ status: 'completed', conclusion: 'failure' }] }), ''));
  await expect(pollReleaseCi({ execFile, repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', pollMs: 0, maxPolls: 1, sleep: jest.fn(), linksOnly: false, log: { info: jest.fn() } })).rejects.toThrow('malformed job records');
});
test('reports a valid detail-level failure', async () => {
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, args[1] === 'list' ? JSON.stringify([{ databaseId: 7, createdAt: '2026-01-01', status: 'completed', conclusion: 'success', headSha: 'abc', headBranch: 'v1.0.0' }]) : JSON.stringify({ status: 'completed', conclusion: 'failure', headSha: 'abc', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'failure' }] }), ''));
  await expect(pollReleaseCi({ execFile, repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', pollMs: 0, maxPolls: 1, sleep: jest.fn(), linksOnly: false, log: { info: jest.fn() } })).rejects.toThrow('ubuntu');
});
test('reports when a failed run has no job records', async () => {
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, args[1] === 'list' ? JSON.stringify([{ databaseId: 5, createdAt: '2026-01-01', status: 'completed', conclusion: 'failure', headSha: 'abc', headBranch: 'v1.0.0' }]) : JSON.stringify({ status: 'completed', conclusion: 'failure', headSha: 'abc', jobs: [] }), ''));
  await expect(pollReleaseCi({ execFile, repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', pollMs: 0, maxPolls: 1, sleep: jest.fn(), linksOnly: false, log: { info: jest.fn() } })).rejects.toThrow('none reported');
});
test('reports unnamed jobs on a failed candidate', async () => {
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, args[1] === 'list' ? JSON.stringify([{ databaseId: 6, createdAt: '2026-01-01', status: 'completed', conclusion: 'failure', headSha: 'abc', headBranch: 'v1.0.0' }]) : JSON.stringify({ status: 'completed', conclusion: 'failure', headSha: 'abc', jobs: [{ status: 'completed', conclusion: 'failure' }] }), ''));
  await expect(pollReleaseCi({ execFile, repo: 'eliware/demo', headSha: 'abc', tag: 'v1.0.0', pollMs: 0, maxPolls: 1, sleep: jest.fn(), linksOnly: false, log: { info: jest.fn() } })).rejects.toThrow('malformed job records');
});
