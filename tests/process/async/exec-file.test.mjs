import { jest } from '@jest/globals';
import { execFileCommand } from '../../../src/process/async/exec-file.mjs';

const okExec = jest.fn((_executable, _args, _options, callback) => callback(null, 'ok', ''));

test('runs an executable asynchronously', async () => {
  await expect(execFileCommand(okExec, 'gh', ['run', 'list'])).resolves.toBe('ok');
});
test('wraps the npm Windows shim without shell execution', async () => {
  const exec = jest.fn((_executable, _args, _options, callback) => callback(null, 'ok', ''));
  await expect(execFileCommand(exec, 'npm.cmd', ['view', 'demo'], undefined, 'win32')).resolves.toBe('ok');
  expect(exec).toHaveBeenCalledWith(
    'cmd.exe',
    ['/d', '/s', '/c', 'npm.cmd', 'view', 'demo'],
    expect.objectContaining({ windowsVerbatimArguments: true }),
    expect.any(Function),
  );
});

test('uses default encoding and propagates command output on failure', async () => {
  const exec = jest.fn((_executable, _args, _options, callback) =>
    callback(Object.assign(new Error('bad'), {}), 'out', 'err'),
  );
  await expect(execFileCommand(exec, 'gh', [])).rejects.toMatchObject({ stdout: 'out', stderr: 'err' });
});

test('rejects invalid runners and arguments', async () => {
  await expect(execFileCommand(null, 'gh', [])).rejects.toThrow('runner');
  await expect(execFileCommand(okExec, 'gh', 'bad')).rejects.toThrow('array');
});
