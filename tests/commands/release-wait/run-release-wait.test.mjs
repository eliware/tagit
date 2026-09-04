import { jest } from '@jest/globals';
import { runReleaseWaitCommand } from '../../../src/commands/release-wait/run-release-wait.mjs';

test('verifies the latest release tag', async () => {
  const execFileSync = jest.fn((command, args) => args[0] === 'describe' ? 'v1.2.3\n' : 'abc\n');
  const verifyRelease = jest.fn();
  await expect(runReleaseWaitCommand({ execFileSync, fs: {}, log: { info: jest.fn() }, verifyRelease, execFile: jest.fn() })).resolves.toEqual({ version: '1.2.3', commitSha: 'abc' });
  expect(verifyRelease).toHaveBeenCalledWith(execFileSync, {}, expect.anything(), { version: '1.2.3', release: { commitSha: 'abc' }, execFile: expect.any(Function) });
});
