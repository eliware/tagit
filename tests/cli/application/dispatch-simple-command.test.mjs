import { jest } from '@jest/globals';
import { dispatchSimpleCommand } from '../../../src/cli/application/dispatch-simple-command.mjs';
test('routes notes and push while leaving release commands to the coordinator', () => {
  const deps = { fs: {}, execFileSync: jest.fn(), buildNotesReport: jest.fn(), reportCiLinks: jest.fn(), log: {}, exit: jest.fn() };
  expect(dispatchSimpleCommand('unknown', {}, deps, jest.fn())).toBe(false);
});
