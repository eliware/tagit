import { jest } from '@jest/globals';
import { isCli, runUpstream } from '../bin/upstream.mjs';

test('merges and pushes with supplied message', () => {
  const exec = jest.fn();
  expect(runUpstream(['merge'], exec)).toBe(true);
  expect(exec.mock.calls).toEqual([
    ['git', ['fetch', 'upstream'], { stdio: 'inherit' }],
    ['git', ['merge', 'upstream/master', '-m', 'merge'], { stdio: 'inherit' }],
    ['git', ['push'], { stdio: 'inherit' }],
  ]);
});
test('reports conflicts and skips push', () => {
  const exec = jest.fn((command, args) => { if (command === 'git' && args[0] === 'merge') throw new Error('conflict'); });
  const log = { log: jest.fn() };
  expect(runUpstream([], exec, new Date('2026-07-29T18:07:59Z'), log)).toBe(false);
  expect(exec).toHaveBeenCalledWith('git', ['diff', '--name-only', '--diff-filter=U'], { stdio: 'inherit' });
  expect(log.log).toHaveBeenCalled();
  expect(isCli(['node', '/x/upstream.mjs'])).toBe(true);
  expect(isCli(['node', '/x/nope'])).toBe(false);
});

test('covers defaults and short cli name', () => {
  const exec = jest.fn();
  const log = { log: jest.fn() };
  runUpstream(undefined, exec, new Date('2026-07-29T18:07:59Z'), log);
  expect(isCli(['node', '/x/upstream'])).toBe(true);
});
