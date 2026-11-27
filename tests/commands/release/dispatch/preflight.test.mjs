import { jest } from "@jest/globals";
import dispatchPreflight from "../../../../src/commands/release/dispatch/preflight.mjs";

test("builds preflight options at the dispatch boundary", () => {
  const runPreflightCommand = jest.fn();
  dispatchPreflight({
    runPreflightCommand,
    execFileSync: jest.fn(),
    fs: {},
    log: { info: jest.fn() },
    output: jest.fn(),
  });
  expect(runPreflightCommand).toHaveBeenCalledWith(expect.objectContaining({ report: true }));
});
