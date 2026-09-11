import { jest } from '@jest/globals';
import { dispatchSimpleCommand } from '../../../src/cli/application/dispatch-simple-command.mjs';
test('routes notes and push while leaving release commands to the coordinator', () => {
  const deps = {
    fs: {},
    execFileSync: jest.fn(),
    buildNotesReport: jest.fn(),
    reportCiLinks: jest.fn(),
    log: {},
    exit: jest.fn(),
  };
  expect(dispatchSimpleCommand('unknown', {}, deps, jest.fn())).toBe(false);
});

test('routes notes to the notes command', () => {
  const buildNotesReport = jest.fn(() => 'notes');
  const output = jest.fn();
  expect(dispatchSimpleCommand('notes', {}, { fs: {}, execFileSync: jest.fn(), buildNotesReport }, output)).toBe(true);
  expect(output).toHaveBeenCalledWith('notes');
});

test('routes push with dry-run policy', () => {
  const execFileSync = jest.fn();
  expect(
    dispatchSimpleCommand(
      'push',
      { dryRun: true },
      { execFileSync, reportCiLinks: jest.fn(), log: { info: jest.fn() }, exit: jest.fn() },
      jest.fn(),
    ),
  ).toBe(true);
});
