import { jest } from "@jest/globals";
import { reportNpmViewResult } from "../../../../../src/registries/npm/error/view/result.mjs";

test("reports available and missing npm versions", () => {
  const log = { info: jest.fn() };
  reportNpmViewResult(log, "npm view demo@1.0.0 (1/2)", true);
  reportNpmViewResult(log, "npm view demo@1.0.0 (2/2)", false);
  expect(log.info).toHaveBeenNthCalledWith(1, "npm view demo@1.0.0 (1/2): available.");
  expect(log.info).toHaveBeenNthCalledWith(2, "npm view demo@1.0.0 (2/2): not found.");
});

test("supports loggers without an info method", () => {
  expect(() => reportNpmViewResult({}, "npm view demo@1.0.0 (1/1)", false)).not.toThrow();
});
