import { npmErrorSummary } from "../../../src/registries/npm/error-summary.mjs";

test.each([
  [{ stderr: "HTTP 404" }, "404 not found"],
  [{ stdout: "E404" }, "404 not found"],
  [{ message: "Not Found" }, "404 not found"],
  [{ stderr: "registry unavailable", code: "EAI_AGAIN" }, "EAI_AGAIN"],
  [{ code: "bad code" }, "request failed"],
  [{}, "request failed"],
])("summarizes npm errors with safe text: %p", (error, expected) => {
  expect(npmErrorSummary(error)).toBe(expected);
});
