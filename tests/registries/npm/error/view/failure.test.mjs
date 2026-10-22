import { jest } from "@jest/globals";
import { reportNpmViewFailure } from "../../../../../src/registries/npm/error/view/failure.mjs";

test("reports concise npm errors", () => {
  const log = { info: jest.fn() };
  reportNpmViewFailure(log, "npm view demo@1.0.0 (1/1)", { stderr: "404 Not Found" });
  expect(log.info).toHaveBeenCalledWith("npm view demo@1.0.0 (1/1): failed (404 not found).");
});

test("supports loggers without an info method", () => {
  expect(() => reportNpmViewFailure({}, "npm view demo@1.0.0 (1/1)", {})).not.toThrow();
});
