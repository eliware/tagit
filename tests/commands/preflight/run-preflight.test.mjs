import { jest } from "@jest/globals";
import { runPreflightCommand } from "../../../src/commands/preflight/run-preflight.mjs";

test("runs and reports exact-HEAD preflight checks", () => {
  const output = jest.fn();
  const log = { info: jest.fn() };
  const checks = { test: { passed: true } };
  expect(
    runPreflightCommand({
      runPreflight: jest.fn(() => checks),
      execFileSync: jest.fn(),
      fs: {},
      log,
      output,
      ignore100x4: false,
    }),
  ).toBe(checks);
  expect(log.info).toHaveBeenCalledWith(
    "Preflight passed: local gates and exact-HEAD Ubuntu CI are green.",
  );
  expect(output).toHaveBeenCalledWith(JSON.stringify({ ok: true, checks }));
});

test("returns checks without a report when report is disabled", () => {
  const output = jest.fn();
  const log = { info: jest.fn() };
  const checks = { test: { passed: true } };
  expect(
    runPreflightCommand({
      runPreflight: jest.fn(() => checks),
      execFileSync: jest.fn(),
      fs: {},
      log,
      output,
      report: false,
    }),
  ).toBe(checks);
  expect(log.info).not.toHaveBeenCalled();
  expect(output).not.toHaveBeenCalled();
});
