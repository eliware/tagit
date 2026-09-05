import { jest } from '@jest/globals';
import { runUpstream } from '../../src/upstream/run-merge.mjs';

test('merges upstream and pushes', () => {
  const exec = jest.fn((command, args) => args[0] === 'symbolic-ref' ? 'refs/remotes/upstream/main\n' : '');
  expect(runUpstream(['merge'], exec)).toBe(true);
  expect(exec).toHaveBeenCalledWith('git', ['push'], { stdio: 'inherit' });
});

test('reports merge conflicts without pushing', () => {
  const exec = jest.fn((command, args) => { if (args[0] === 'merge') throw new Error('conflict'); return ''; });
  const log = { log: jest.fn() };
  expect(runUpstream(['merge'], exec, new Date(), log)).toBe(false);
  expect(exec).not.toHaveBeenCalledWith('git', ['push'], expect.anything());
});
test('runs with explicit time and logger dependencies', () => {
  const exec = jest.fn((command, args) => args[0] === 'symbolic-ref' ? 'refs/remotes/upstream/main\n' : '');
  expect(runUpstream([], exec, new Date('2026-07-29T18:07:59Z'), console)).toBe(true);
});
