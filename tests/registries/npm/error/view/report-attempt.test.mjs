import { jest } from "@jest/globals";
import { reportNpmViewAttempt } from "../../../../../src/registries/npm/error/view/report-attempt.mjs";

test("reports available and missing npm results", () => {
  const log = { info: jest.fn() };
  expect(
    reportNpmViewAttempt(log, "npm view demo@1.0.0 (1/2)", {
      output: '"1.0.0"',
      version: "1.0.0",
    }),
  ).toBe(true);
  expect(
    reportNpmViewAttempt(log, "npm view demo@1.0.0 (2/2)", {
      output: '"0.9.0"',
      version: "1.0.0",
    }),
  ).toBe(false);
  expect(log.info.mock.calls.map(([message]) => message)).toEqual([
    "npm view demo@1.0.0 (1/2): available.",
    "npm view demo@1.0.0 (2/2): not found.",
  ]);
});

test("reports command failures through the failure reporter", () => {
  const log = { info: jest.fn() };
  expect(
    reportNpmViewAttempt(log, "npm view demo@1.0.0 (1/1)", { error: { code: "EAI_AGAIN" } }),
  ).toBe(false);
  expect(log.info).toHaveBeenCalledWith("npm view demo@1.0.0 (1/1): failed (EAI_AGAIN).");
});
