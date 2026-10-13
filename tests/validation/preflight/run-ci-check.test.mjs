import { jest } from "@jest/globals";
import { runCiCheck } from "../../../src/validation/preflight/run-ci-check.mjs";

test("returns a CI result without a blocker when verification has no error", () => {
  expect(runCiCheck(() => "", { info: jest.fn() }, "dirty", {})).toEqual({
    result: { passed: false, blocked: true },
    failure: null,
  });
});

test("converts a CI verification error to a preflight blocker", () => {
  const exec = (command, args) => {
    if (args[0] === "status") return "";
    throw new Error("CI unavailable");
  };
  expect(runCiCheck(exec, { info: jest.fn() }, "", {})).toMatchObject({
    result: { passed: false, error: expect.any(Error) },
    failure: expect.stringContaining("GitHub CI verification failed"),
  });
});
