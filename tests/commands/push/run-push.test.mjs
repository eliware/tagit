import { jest } from '@jest/globals';
import { runPushCommand } from '../../../src/commands/push/run-push.mjs';

test('pushes the existing HEAD and reports its CI links', () => {
  const execFileSync = jest.fn((command, args) => args[0] === 'rev-parse' ? 'abc\n' : undefined);
  const reportCiLinks = jest.fn();
  const log = { info: jest.fn(), error: jest.fn() };
  runPushCommand({ execFileSync, reportCiLinks, log, exit: jest.fn(), dryRun: false });
  expect(execFileSync).toHaveBeenCalledWith('git', ['push'], { stdio: 'inherit' });
  expect(reportCiLinks).toHaveBeenCalledWith(execFileSync, log, 'abc', { attempts: 10, delayMs: 2000 });
});

test('does not mutate or inspect CI during a dry run', () => {
  const execFileSync = jest.fn();
  const log = { info: jest.fn(), error: jest.fn() };
  runPushCommand({ execFileSync, reportCiLinks: jest.fn(), log, exit: jest.fn(), dryRun: true });
  expect(execFileSync).not.toHaveBeenCalled();
});

test('reports push failures and exits nonzero', () => {
  const exit = jest.fn();
  const log = { info: jest.fn(), error: jest.fn() };
  expect(() => runPushCommand({ execFileSync: jest.fn(() => { throw new Error('push failed'); }), reportCiLinks: jest.fn(), log, exit, dryRun: false })).toThrow('push failed');
  expect(exit).toHaveBeenCalledWith(1);
});
