import { jest } from '@jest/globals';
import { isCli, runPush } from '../bin/push.mjs';

test('pushes with supplied message', () => {
  const exec = jest.fn((command) => {
    if (command === 'git diff --cached --quiet') throw new Error('changes staged');
  });
  runPush(['hello', 'world'], exec);
  expect(exec.mock.calls).toEqual([
    ['git add .', { stdio: 'inherit' }],
    ['git diff --cached --quiet'],
    ['git commit -m "hello world"', { stdio: 'inherit' }],
    ['git push', { stdio: 'inherit' }],
  ]);
});
test('generates default message and detects cli', () => {
  const exec = jest.fn();
  runPush([], exec, new Date('2026-07-29T18:07:59Z'));
  expect(exec.mock.calls[1][0]).toBe('git diff --cached --quiet');
  expect(isCli(['node', '/x/push.mjs'])).toBe(true);
  expect(isCli(['node', '/x/nope'])).toBe(false);
});

test('covers defaults and short cli name', () => {
  const exec = jest.fn();
  runPush(undefined, exec, new Date('2026-07-29T18:07:59Z'));
  expect(isCli(['node', '/x/push'])).toBe(true);
});
