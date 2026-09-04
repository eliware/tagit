import { jest } from '@jest/globals';
import { runProcess } from '../../../src/process/sync/run-process.mjs';

test('runs an injected synchronous process without shell parsing', () => {
  const exec = jest.fn(() => 'output');
  expect(runProcess(exec, 'tool', ['a b', '$(literal)'], { encoding: 'utf8' })).toBe('output');
  expect(exec).toHaveBeenCalledWith('tool', ['a b', '$(literal)'], { encoding: 'utf8' });
});

test('validates synchronous process inputs', () => {
  expect(() => runProcess(null, 'git')).toThrow('synchronous process runner');
  expect(() => runProcess(jest.fn(), '')).toThrow('executable');
  expect(() => runProcess(jest.fn(), 'git', 'status')).toThrow('array');
});
