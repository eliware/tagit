import { classifyNpmError } from "../../../../src/registries/npm/error/classification.mjs";

test.each([
  [{ stderr: "HTTP 404" }, { type: "not-found" }],
  [{ stderr: "E404" }, { type: "not-found" }],
  [
    { stderr: "registry unavailable", code: "EAI_AGAIN" },
    { type: "code", code: "EAI_AGAIN" },
  ],
  [{ code: "bad code" }, { type: "request-failed" }],
  [{}, { type: "request-failed" }],
])("classifies npm error data %p", (error, expected) => {
  expect(classifyNpmError(error)).toEqual(expected);
});
