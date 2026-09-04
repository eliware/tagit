import { jest } from '@jest/globals';
import { runProcessAsync } from '../../../src/process/async/run-process.mjs';

test('runs an injected asynchronous process and captures output', async () => {
  const exec = jest.fn((command, args, options, callback) => callback(null, 'out', 'err'));
  await expect(runProcessAsync(exec, 'gh', ['run'], {})).resolves.toEqual({ stdout: 'out', stderr: 'err' });
});

test('propagates asynchronous failures and validates inputs', async () => {
  const error = new Error('failed');
  await expect(runProcessAsync((command, args, options, callback) => callback(error, 'out', 'err'), 'gh')).rejects.toMatchObject({ message: 'failed', stdout: 'out', stderr: 'err' });
  await expect(runProcessAsync(null, 'gh')).rejects.toThrow('asynchronous process runner');
  await expect(runProcessAsync(jest.fn(), '', [])).rejects.toThrow('executable');
  await expect(runProcessAsync(jest.fn(), 'gh', 'run')).rejects.toThrow('array');
});
