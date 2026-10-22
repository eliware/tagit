import { jest } from "@jest/globals";
import { reportNpmViewAttempt } from "../../../../../src/registries/npm/error/view/attempt.mjs";

test("reports whether an npm view result contains the requested version", () => {
  const log = { info: jest.fn() };
  expect(
    reportNpmViewAttempt(log, "npm view demo@1.0.0 (1/1)", {
      output: '"1.0.0"',
      version: "1.0.0",
    }),
  ).toBe(true);
  expect(log.info).toHaveBeenCalledWith("npm view demo@1.0.0 (1/1): available.");
});

test("reports missing versions and command failures as unsuccessful attempts", () => {
  const log = { info: jest.fn() };
  expect(
    reportNpmViewAttempt(log, "npm view demo@1.0.0 (1/2)", {
      output: '"0.9.0"',
      version: "1.0.0",
    }),
  ).toBe(false);
  reportNpmViewAttempt(log, "npm view demo@1.0.0 (2/2)", {
    error: { stderr: "npm error 404 Not Found" },
  });
  expect(log.info).toHaveBeenNthCalledWith(1, "npm view demo@1.0.0 (1/2): not found.");
  expect(log.info).toHaveBeenNthCalledWith(2, "npm view demo@1.0.0 (2/2): failed (404 not found).");
});
