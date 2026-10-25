import { classifyNpmErrorSummary } from "../../../../../src/registries/npm/error/summary/classify.mjs";

test.each([
  [{ type: "not-found" }, "404 not found"],
  [{ type: "code", code: "EAI_AGAIN" }, "EAI_AGAIN"],
  [{ type: "code", code: "bad code" }, "request failed"],
  [{ type: "request-failed" }, "request failed"],
])("selects a safe npm error summary for %p", (classification, expected) => {
  expect(classifyNpmErrorSummary(classification)).toBe(expected);
});
