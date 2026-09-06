import { jest } from '@jest/globals';
import { runPreflightCommand } from '../../../src/commands/preflight/run-preflight.mjs';

test('runs and reports exact-HEAD preflight checks', () => {
  const output = jest.fn();
  const checks = { test: { passed: true } };
  expect(
    runPreflightCommand({
      runPreflight: jest.fn(() => checks),
      execFileSync: jest.fn(),
      fs: {},
      log: { info: jest.fn() },
      output,
      ignore100x4: false,
    }),
  ).toBe(checks);
  expect(output).toHaveBeenCalledWith(JSON.stringify({ ok: true, checks }));
});
