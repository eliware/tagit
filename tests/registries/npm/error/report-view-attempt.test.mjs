import { jest } from "@jest/globals";
import {
  reportNpmViewFailure,
  reportNpmViewResult,
} from "../../../../src/registries/npm/error/report-view-attempt.mjs";

test("reports available and missing npm versions", () => {
  const log = { info: jest.fn() };
  reportNpmViewResult(log, "npm view demo@1.0.0 (1/2)", true);
  reportNpmViewResult(log, "npm view demo@1.0.0 (2/2)", false);
  expect(log.info).toHaveBeenNthCalledWith(1, "npm view demo@1.0.0 (1/2): available.");
  expect(log.info).toHaveBeenNthCalledWith(2, "npm view demo@1.0.0 (2/2): not found.");
});

test("reports concise npm errors and supports loggers without info", () => {
  const log = { info: jest.fn() };
  reportNpmViewFailure(log, "npm view demo@1.0.0 (1/1)", { stderr: "404 Not Found" });
  expect(log.info).toHaveBeenCalledWith("npm view demo@1.0.0 (1/1): failed (404 not found).");
  expect(() => reportNpmViewResult({}, "npm view demo@1.0.0 (1/1)", false)).not.toThrow();
  expect(() => reportNpmViewFailure({}, "npm view demo@1.0.0 (1/1)", {})).not.toThrow();
});
