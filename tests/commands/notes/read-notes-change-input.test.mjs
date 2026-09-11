import { jest } from '@jest/globals';
import { readNotesChangeInput } from '../../../src/commands/notes/read-notes-change-input.mjs';

test('reads the latest tag, changed files, and diff through injected Git', () => {
  const exec = jest.fn((_executable, args) =>
    args[0] === 'describe' ? 'v1.2.3\n' : args[1] === '--name-only' ? 'src/index.mjs\n' : '+change',
  );
  expect(readNotesChangeInput(exec)).toEqual({ latestTag: 'v1.2.3', changedFiles: 'src/index.mjs\n', diff: '+change' });
  expect(exec).toHaveBeenCalledTimes(3);
});
