import { jest } from '@jest/globals';
import { runReleaseWaitCommand } from '../../../src/commands/release-wait/run-release-wait.mjs';
import { runTagit } from '../../../src/cli/application/run-tagit.mjs';
import packageData from '../../../package.json' with { type: 'json' };

test('verifies the latest release tag', async () => {
  const execFileSync = jest.fn((command, args) => (args[0] === 'describe' ? 'v1.2.3\n' : 'abc\n'));
  const verifyRelease = jest.fn();
  await expect(
    runReleaseWaitCommand({ execFileSync, fs: {}, log: { info: jest.fn() }, verifyRelease, execFile: jest.fn() }),
  ).resolves.toEqual({ version: '1.2.3', commitSha: 'abc' });
  expect(verifyRelease).toHaveBeenCalledWith(execFileSync, {}, expect.anything(), {
    version: '1.2.3',
    release: { commitSha: 'abc' },
    execFile: expect.any(Function),
  });
});

test('CLI release-wait follows the latest tag and rejects explicit versions', async () => {
  const execFileSync = jest.fn((command, args) => (args[0] === 'describe' ? `v${packageData.version}` : 'abc'));
  const verifyRelease = jest.fn().mockResolvedValue({});
  await runTagit(
    {
      execFileSync,
      verifyRelease,
      log: { info: jest.fn(), error: jest.fn() },
      registerHandlersFn: jest.fn(),
      registerSignalsFn: jest.fn(),
    },
    ['release-wait'],
  );
  expect(verifyRelease).toHaveBeenCalled();
  const exit = jest.fn(() => {
    throw new Error('exit');
  });
  await expect(
    runTagit({ exit, log: { error: jest.fn() }, registerHandlersFn: jest.fn(), registerSignalsFn: jest.fn() }, [
      'release-wait',
      '--version',
      packageData.version,
    ]),
  ).rejects.toThrow('exit');
});
