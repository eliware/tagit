import { jest } from "@jest/globals";
import { dispatchReleaseOperation } from "../../../../../src/commands/release/dispatch/release/operation-dispatch.mjs";

test("forwards release options and dependencies to the release command", async () => {
  const options = { version: "1.0.0" };
  const dependencies = { fs: {}, log: { info: jest.fn() } };
  const result = { started: true };
  const runReleaseCommand = jest.fn(async () => result);
  await expect(
    dispatchReleaseOperation(options, { ...dependencies, runReleaseCommand }),
  ).resolves.toBe(result);
  expect(runReleaseCommand).toHaveBeenCalledWith({ options, ...dependencies });
});
