import { jest } from '@jest/globals';
import { collectNotesChanges } from '../../../src/commands/notes/collect-changes.mjs';

test('collects commits, changed files, and bounded source diff', () => {
  const exec = jest.fn((command, args) =>
    args[0] === 'log' ? 'commit' : args[1] === '--name-status' ? 'file' : 'x'.repeat(12001),
  );
  expect(collectNotesChanges(exec, 'v1.0.0')).toMatchObject({
    commits: 'commit',
    files: 'file',
    excerpt: expect.stringContaining('diff truncated'),
  });
});
