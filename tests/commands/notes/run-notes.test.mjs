import { jest } from '@jest/globals';
import { runNotesCommand } from '../../../src/commands/notes/run-notes.mjs';

test('builds and prints the notes report', () => {
  const output = jest.fn();
  expect(runNotesCommand({ fs: {}, execFileSync: jest.fn(), buildNotesReport: jest.fn(() => 'report'), output })).toBe(
    'report',
  );
  expect(output).toHaveBeenCalledWith('report');
});
