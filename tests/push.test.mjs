import { jest } from '@jest/globals';
import { isCli, runPush } from '../bin/push.mjs';

test('pushes existing commits without staging or committing', () => {
  const exec = jest.fn();
  runPush(['hello', 'world'], exec);
  expect(exec.mock.calls).toEqual([['git push', { stdio: 'inherit' }]]);
});
test('generates default message and detects cli', () => {
  const exec = jest.fn();
  runPush([], exec, new Date('2026-07-29T18:07:59Z'));
  expect(exec).toHaveBeenCalledWith('git push', { stdio: 'inherit' });
  expect(isCli(['node', '/x/push.mjs'])).toBe(true);
  expect(isCli(['node', '/x/nope'])).toBe(false);
});

test('covers defaults and short cli name', () => {
  const exec = jest.fn();
  runPush(undefined, exec, new Date('2026-07-29T18:07:59Z'));
  expect(isCli(['node', '/x/push'])).toBe(true);
});
