import { jest } from '@jest/globals';
import { resolveExecutable, runProcess, runProcessAsync } from '../src/processRunner.mjs';

test('resolves command shims on Windows only', () => {
  expect(resolveExecutable('npm', 'win32')).toBe('npm.cmd');
  expect(resolveExecutable('npx', 'win32')).toBe('npx.cmd');
  expect(resolveExecutable('composer', 'win32')).toBe('composer.cmd');
  expect(resolveExecutable('git', 'win32')).toBe('git');
  expect(resolveExecutable('npm', 'linux')).toBe('npm');
});

test('passes executable, argument array, and options to the injected runner', () => {
  const execFileSync = jest.fn(() => 'output');
  const options = { encoding: 'utf8', timeout: 1000 };

  expect(runProcess(execFileSync, 'git', ['status', '--short'], options)).toBe('output');
  expect(execFileSync).toHaveBeenCalledWith('git', ['status', '--short'], options);
});

test('rejects missing executables and non-array arguments', () => {
  expect(() => runProcess(jest.fn(), '', [])).toThrow('A process executable is required');
  expect(() => runProcess(jest.fn(), 'git', 'status')).toThrow('Process arguments must be an array');
});

test('runs asynchronously without a shell and returns captured output', async () => {
  const execFile = jest.fn((executable, args, options, callback) => callback(null, 'out', 'err'));
  await expect(runProcessAsync(execFile, 'gh', ['run', 'list'], { encoding: 'utf8' })).resolves.toEqual({ stdout: 'out', stderr: 'err' });
  expect(execFile).toHaveBeenCalledWith('gh', ['run', 'list'], { encoding: 'utf8' }, expect.any(Function));
});

test('propagates asynchronous process failures and captured output', async () => {
  const error = new Error('failed');
  const execFile = jest.fn((executable, args, options, callback) => callback(error, 'out', 'err'));
  await expect(runProcessAsync(execFile, 'gh', [])).rejects.toMatchObject({ message: 'failed', stdout: 'out', stderr: 'err' });
});

test('validates asynchronous runner inputs', async () => {
  await expect(runProcessAsync(jest.fn(), '', [])).rejects.toThrow();
  await expect(runProcessAsync(jest.fn(), 'gh', 'run')).rejects.toThrow();
});
