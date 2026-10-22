import { npmErrorSummary } from "../../../../src/registries/npm/error/summary.mjs";

test.each([
  [{ stderr: "HTTP 404" }, "404 not found"],
  [{ code: "EAI_AGAIN" }, "EAI_AGAIN"],
  [{}, "request failed"],
])("formats a concise npm error summary: %p", (error, expected) => {
  expect(npmErrorSummary(error)).toBe(expected);
});
