import { jest } from '@jest/globals';
import { runProcess } from '../src/processRunner.mjs';

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
