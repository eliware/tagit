import { jest } from '@jest/globals';
import { mergeUpstream } from '../../src/upstream/merge-upstream.mjs';

test('merges successfully', () => {
  const exec = jest.fn();
  expect(mergeUpstream(exec, 'upstream/main', 'sync', { log: jest.fn() })).toBe(true);
  expect(exec).toHaveBeenCalledWith('git', ['merge', 'upstream/main', '-m', 'sync'], { stdio: 'inherit' });
});

test('reports conflicts and does not claim success', () => {
  const exec = jest.fn((command, args) => { if (args[0] === 'merge') throw new Error('conflict'); return ''; });
  const log = { log: jest.fn() };
  expect(mergeUpstream(exec, 'upstream/main', 'sync', log)).toBe(false);
  expect(log.log).toHaveBeenCalled();
});
