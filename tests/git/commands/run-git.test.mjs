import { jest } from '@jest/globals';
import { runGit } from '../../../src/git/commands/run-git.mjs';

test('runs git with forwarded arguments and options', () => {
  const exec = jest.fn();
  runGit(exec, ['status'], { encoding: 'utf8' });
  expect(exec).toHaveBeenCalledWith('git', ['status'], { encoding: 'utf8' });
});

test('uses empty options when none are provided', () => {
  const exec = jest.fn();
  runGit(exec, ['status']);
  expect(exec).toHaveBeenCalledWith('git', ['status'], {});
});
